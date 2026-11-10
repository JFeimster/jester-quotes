import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot=fileURLToPath(new URL('../../',import.meta.url));
const distRoot=path.join(projectRoot,'dist');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function chromeBinary(){
  if(process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN))return process.env.CHROME_BIN;
  const candidates=process.platform==='win32'?
    [path.join(process.env['PROGRAMFILES']??'C:\\Program Files','Google/Chrome/Application/chrome.exe'),
     path.join(process.env['PROGRAMFILES(X86)']??'C:\\Program Files (x86)','Google/Chrome/Application/chrome.exe')]
    :['google-chrome','google-chrome-stable','chromium','chromium-browser'];
  for(const entry of candidates){
    if(existsSync(entry))return entry;
    try{return execFileSync('which',[entry],{encoding:'utf8'}).trim();}
    catch{/* try next */ }
  }
  return null;
}
const mime={
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8',
  '.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png',
  '.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2'
};
async function startServer(){
  const server=http.createServer(async(req,res)=>{
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url??'/','http://localhost').pathname);}
    catch{res.writeHead(400).end('Invalid URL');return;}
    let file=path.resolve(distRoot,'.'+pathname);
    if(!file.startsWith(distRoot+path.sep)&&file!==distRoot){res.writeHead(403).end('Forbidden');return;}
    try {
      let stat=await fs.stat(file);
      if(stat.isDirectory())file=path.join(file,'index.html');
      const ext=path.extname(file).toLowerCase();
      const data=await fs.readFile(file);
      res.writeHead(200,{'Content-Type':mime[ext]??'application/octet-stream','Cache-Control':'no-store'});
      res.end(data);
    }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();
  assert.ok(address && typeof address==='object');
  return {server,origin:`http://127.0.0.1:${address.port}`};
}
class Connection {
  constructor(socket){
    this.socket=socket;this.seq=0;this.pending=new Map();this.exceptions=[];
    socket.addEventListener('message',event=>{
      let msg;try{msg=JSON.parse(event.data);}catch{return;}
      if(msg.method==='Runtime.exceptionThrown'){
        const d=msg.params?.exceptionDetails;
        this.exceptions.push(d?.exception?.description??d?.text??'JS exception');
      }
      if(msg.method==='Page.javascriptDialogOpening')this.send('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{});
      if(msg.id){
        const p=this.pending.get(msg.id);if(!p)return;
        this.pending.delete(msg.id);clearTimeout(p.timer);
        msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result??{});
      }
    });
  }
  static async open(url){
    const socket=new WebSocket(url);
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('CDP websocket timeout')),10000);
      socket.addEventListener('open',()=>{clearTimeout(timeout);resolve();},{once:true});
      socket.addEventListener('error',()=>{clearTimeout(timeout);reject(new Error('CDP websocket failed'));},{once:true});
    });
    return new Connection(socket);
  }
  send(method,params={}){
    const id=++this.seq;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('CDP timeout: '+method));},18000);
      this.pending.set(id,{resolve,reject,timer});
      this.socket.send(JSON.stringify({id,method,params}));
    });
  }
  async evaluate(expression){
    const response=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});
    if(response.exceptionDetails)throw new Error('Browser evaluation: '+(response.exceptionDetails.exception?.description??response.exceptionDetails.text));
    return response.result?.value;
  }
  close(){this.socket.close();}
}
async function chromeProfile(profile,child){
  let port;
  for(let i=0;i<140;i++){
    if(child.exitCode!==null)throw new Error('Chrome exited before DevTools became available');
    try{
      const text=await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8');
      port=Number(text.split('\n')[0]);if(port>0)break;
    }catch{/* Chrome still launching */}
    await sleep(100);
  }
  if(!port)throw new Error('Chrome DevToolsActivePort did not appear');
  return port;
}
export async function openLocalBrowser(){
  const executable=chromeBinary();
  if(!executable){
    if(process.env.GITHUB_ACTIONS==='true')throw new Error('GitHub runner has no Chrome; browser QA cannot silently skip in CI.');
    return null;
  }
  assert.ok(existsSync(path.join(distRoot,'index.html')),'Build dist/ before browser QA');
  const profile=await fs.mkdtemp(path.join(os.tmpdir(),'jester-qa-profile-'));
  const downloads=await fs.mkdtemp(path.join(os.tmpdir(),'jester-qa-downloads-'));
  const screenshots=path.join(projectRoot,'.qa-screenshots');
  await fs.mkdir(screenshots,{recursive:true});
  const {server,origin}=await startServer();
  const child=spawn(executable,[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
    '--no-first-run','--disable-extensions','--disable-background-networking',
    '--remote-allow-origins=*','--remote-debugging-port=0',
    `--user-data-dir=${profile}`,'about:blank'
  ],{stdio:'ignore'});
  let page,browser;
  try{
    const port=await chromeProfile(profile,child);
    const response=await fetch(`http://127.0.0.1:${port}/json/list`);
    assert.ok(response.ok,'Chrome target list');
    const target=(await response.json()).find(x=>x.type==='page');
    assert.ok(target?.webSocketDebuggerUrl,'Chrome page target');
    page=await Connection.open(target.webSocketDebuggerUrl);
    const browserTarget=await fetch(`http://127.0.0.1:${port}/json/version`).then(x=>x.json());
    browser=await Connection.open(browserTarget.webSocketDebuggerUrl);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    await browser.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});
  }catch(error){
    page?.close();browser?.close();child.kill();server.close();
    await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});
    await fs.rm(downloads,{recursive:true,force:true}).catch(()=>{});
    throw error;
  }
  async function waitFor(expression,caption,limit=9000){
    const until=Date.now()+limit;
    while(Date.now()<until){
      try{if(await page.evaluate(`Boolean(${expression})`))return;}
      catch{/* navigation may have destroyed the prior execution context */}
      await sleep(90);
    }
    throw new Error('Timed out waiting for '+caption+': '+expression);
  }
  async function navigate(route){
    page.exceptions.length=0;
    await page.send('Page.navigate',{url:origin+route});
    await waitFor(`location.pathname===${JSON.stringify(route)} && document.readyState==='complete'`,'navigate '+route,14000);
    await sleep(130);
  }
  async function viewport(width,height){
    await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<=680});
    await sleep(80);
  }
  async function screenshot(name){
    const img=await page.send('Page.captureScreenshot',{format:'png',fromSurface:true});
    const bytes=Buffer.from(img.data??'','base64');
    assert.ok(bytes.length>1000,'Screenshot unexpectedly empty: '+name);
    const saved=path.join(screenshots,name+'.png');
    await fs.writeFile(saved,bytes);
    return saved;
  }
  async function waitDownload(matcher,limit=16000){
    const until=Date.now()+limit;
    while(Date.now()<until){
      const names=await fs.readdir(downloads);
      const match=names.find(n=>matcher.test(n)&&!n.endsWith('.crdownload'));
      if(match){
        const filename=path.join(downloads,match);
        if((await fs.stat(filename)).size>100) return filename;
      }
      await sleep(110);
    }
    throw new Error('Expected browser download did not appear: '+matcher);
  }
  return {
    page,browser,origin,downloads,screenshots,child,
    navigate,viewport,screenshot,waitFor,waitDownload,eval:expression=>page.evaluate(expression),
    async cleanup(){
      page.close();browser.close();child.kill();
      await new Promise(resolve=>server.close(resolve));
      await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});
      await fs.rm(downloads,{recursive:true,force:true}).catch(()=>{});
    }
  };
}

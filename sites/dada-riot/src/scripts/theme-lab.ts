// Accessible, local-only tab switching. No new storage, theme duplication,
// URL hash requirement, runtime request or side effects on public pages.
const tabs=[...document.querySelectorAll<HTMLButtonElement>('[data-lab-tab]')];
const panels=[...document.querySelectorAll<HTMLElement>('[data-lab-panel]')];
const label=document.querySelector<HTMLElement>('#lab-selected-label');
function activate(id:string,focus=false):void {
  const selected=tabs.find(tab=>tab.dataset.labTab===id);
  if(!selected)return;
  for(const tab of tabs) {
    const active=tab===selected;
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
  }
  for(const panel of panels)panel.hidden=panel.dataset.labPanel!==id;
  if(label)label.textContent=selected.querySelector('strong')?.textContent??id;
  if(focus)selected.focus();
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activate(tab.dataset.labTab??''));
  tab.addEventListener('keydown',event=>{
    let target=index;
    if(event.key==='ArrowRight')target=(index+1)%tabs.length;
    else if(event.key==='ArrowLeft')target=(index-1+tabs.length)%tabs.length;
    else if(event.key==='Home')target=0;
    else if(event.key==='End')target=tabs.length-1;
    else return;
    event.preventDefault();
    activate(tabs[target].dataset.labTab??'',true);
  });
});
activate('midnight-carnival');

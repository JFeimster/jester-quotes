#!/usr/bin/env node
/**
 * Stage 1 structural validator. Does not require a canonical asset registry.
 * CI-safe: checks intended directory layout and protects legacy URLs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const settings = JSON.parse(fs.readFileSync(path.join(projectRoot, 'config/asset-architecture.json'), 'utf8'));
const root = path.join(projectRoot, settings.root);
const errors = [];
const fail = message => errors.push(message);
const ratioSet = new Set(settings.ratioDirectories);
const required = new Set(settings.directories);
const allowedExt = new Set([...settings.imageExtensions, ...settings.videoExtensions, ...settings.otherExtensions]);
const forbidden = ['..', '.', ''];
const toPosix = value => value.split(path.sep).join('/');

if (!fs.existsSync(root)) fail('Missing asset root: ' + settings.root);
for (const dir of required) {
  if (dir.startsWith('/') || dir.includes('\\') || dir.split('/').some(segment => forbidden.includes(segment))) {
    fail('Unsafe directory entry in configuration: ' + dir);
    continue;
  }
  if (!fs.statSync(root, { throwIfNoEntry: false })?.isDirectory()) continue;
  const full = path.join(root, dir);
  if (!fs.statSync(full, { throwIfNoEntry: false })?.isDirectory()) fail('Missing directory: ' + path.posix.join(settings.root, dir));
}
for (const legacy of settings.legacyPreserved) {
  if (!fs.existsSync(path.join(projectRoot, legacy))) fail('Legacy asset missing/moved: ' + legacy);
}
const fullPaths = new Set();
for (const dir of required) {
  const parts = dir.split('/');
  for (let i = 1; i <= parts.length; i++) fullPaths.add(parts.slice(0, i).join('/'));
}
const formatPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/;
function inspect(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name);
    const relative = toPosix(path.relative(root, full));
    if (entry.isSymbolicLink()) {
      fail('Symlinks are not permitted in public assets: ' + relative);
      continue;
    }
    if (entry.isDirectory()) {
      if (!fullPaths.has(relative)) fail('Undeclared asset directory: ' + relative);
      inspect(full);
      continue;
    }
    if (!entry.isFile()) {
      fail('Unsupported filesystem entry: ' + relative);
      continue;
    }
    if (entry.name === '.gitkeep') continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (!allowedExt.has(extension) || !formatPattern.test(entry.name)) fail('Invalid asset filename or extension: ' + relative);
    const segments = relative.split('/');
    const configuredRatio = segments.find(segment => ratioSet.has(segment));
    if (configuredRatio && !entry.name.replace(extension, '').endsWith('-' + configuredRatio)) {
      fail('Ratio folder requires matching filename suffix: ' + relative);
    }
  }
}
if (fs.statSync(root, { throwIfNoEntry: false })?.isDirectory()) inspect(root);
if (errors.length) {
  console.error('Asset architecture validation failed (' + errors.length + '):\n- ' + errors.join('\n- '));
  process.exitCode = 1;
} else {
  console.log('Asset Architecture v' + settings.version + ': ' + required.size + ' directories validated; legacy URLs preserved.');
}

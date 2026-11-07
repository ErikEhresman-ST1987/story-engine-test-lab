'use strict';
// Generic story compiler: no NPC, inventory, save-key or UI assumptions.
// Usage: node scripts/compile-story-directory.cjs <story-folder> <output-json>
const fs=require('node:fs');
const path=require('node:path');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
function compileDirectory(folder){
 const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
 const files={};
 for(const chapter of manifest.chapters){
  const file=path.resolve(folder,chapter.inkFile);
  if(!file.startsWith(path.resolve(folder)+path.sep))throw Error('Ink file outside story directory');
  files[chapter.inkFile]=fs.readFileSync(file,'utf8');
 }
 return {manifest,compiledChapters:compilePackage(manifest,files).chapters};
}
if(require.main===module){
 const [, ,folder,out]=process.argv;
 if(!folder||!out){process.stderr.write('Usage: node scripts/compile-story-directory.cjs <story-folder> <output-json>\n');process.exitCode=2;}
 else{
  const compiled=compileDirectory(path.resolve(folder));
  fs.writeFileSync(path.resolve(out),JSON.stringify(compiled,null,2)+'\n');
  process.stdout.write('Compiled '+compiled.manifest.storyId+'\n');
 }
}
module.exports={compileDirectory};

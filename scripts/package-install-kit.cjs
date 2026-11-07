'use strict';
// Creates a self-contained source handoff, not a new engine or a production deployment.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'dist','story-engine-install-kit');
fs.rmSync(out,{recursive:true,force:true});
function copy(from,to=from){
 const target=path.join(out,to);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.cpSync(path.join(root,from),target,{recursive:true});
}
copy('packages/story-engine');
copy('scripts/compile-story-directory.cjs');
copy('fixtures/three-chapter');
copy('docs/integrations/INSTALL-CANONICAL-INK-ENGINE.md','INSTALL.md');
copy('docs/integrations/PORTABLE-BROWSER-ACCEPTANCE.md','ACCEPTANCE.md');
fs.writeFileSync(path.join(out,'package.json'),JSON.stringify({
 name:'portable-ink-story-engine-install-kit',
 private:true,
 version:'0.1.0',
 dependencies:{inkjs:'2.4.0'},
 scripts:{'compile:example':'node scripts/compile-story-directory.cjs fixtures/three-chapter compiled-example.json'}
},null,2)+'\n');
fs.writeFileSync(path.join(out,'README.md'),[
 '# Reusable Ink story engine — installation handoff',
 '',
 'This is the **existing canonical engine**, packaged for a future game. It is not a second engine or a game.',
 '',
 'Contents: `packages/story-engine/` canonical runtime and compiler; `scripts/compile-story-directory.cjs` generic story compiler; `fixtures/three-chapter/` **test-only** story; `INSTALL.md` host integration contract; `ACCEPTANCE.md` remaining device checks.',
 '',
 'When needed: run `npm install` in this directory and `npm run compile:example`. The game supplies a host adapter, UI, saving, asset bundling and offline behavior. Do not deploy the fixture as game content.',
 '',
 'Status: source handoff verified by repository CI; real-device Safari/offline acceptance is not recorded. Do not modify Little Field Farm or its save keys.',
 ''
].join('\n'));
console.log('Prepared '+path.relative(root,out));

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Story}=require('inkjs');
const {compilePackage}=require('../packages/story-engine/compile-package.cjs');
const manifest=()=>({schema:1,storyId:'training-example',contentVersion:'1.0.0',sourceApproval:'sample-only-not-an-approved-story',chapters:[{id:'chapter-1',inkFile:'one.ink',entry:'start',completion:'complete'},{id:'chapter-2',inkFile:'two.ink',entry:'start',completion:'complete'}],requiresFacts:[],events:[],effects:[]});
const source='=== start ===\nA visitor asks for help.\n* [Help] -> helping\n* [Wait] -> waiting\n=== helping ===\nYou offer to help.\n-> END\n=== waiting ===\nYou decide to wait.\n-> END\n=== complete ===\nThe task is complete.\n-> END\n';
test('compiles two chapters and runs both choice paths',()=>{
 const output=compilePackage(manifest(),{'one.ink':source,'two.ink':source});
 assert.equal(Object.keys(output.chapters).length,2);
 const story=new Story(output.chapters['chapter-1'].compiled);
 story.ChoosePathString('start');assert.match(story.Continue(),/visitor/);
 assert.equal(story.currentChoices.length,2);
 story.ChooseChoiceIndex(0);assert.match(story.Continue(),/offer/);
 const other=new Story(output.chapters['chapter-1'].compiled);
 other.ChoosePathString('start');other.Continue();other.ChooseChoiceIndex(1);
 assert.match(other.Continue(),/wait/);
});
test('refuses missing Ink files, malformed Ink and missing checkpoints',()=>{
 assert.throws(()=>compilePackage(manifest(),{'one.ink':source}),/Missing Ink source/);
 assert.throws(()=>compilePackage(manifest(),{'one.ink':'=== start ===\n-> nonexistent\n','two.ink':source}),/compile failed/i);
 const bad=source.replace('=== complete ===','=== another ===');
 assert.throws(()=>compilePackage(manifest(),{'one.ink':bad,'two.ink':source}),/checkpoint/i);
});
test('refuses unapproved or malformed package metadata',()=>{
 const m=manifest();m.sourceApproval='';assert.throws(()=>compilePackage(m,{'one.ink':source,'two.ink':source}),/sourceApproval/);
});

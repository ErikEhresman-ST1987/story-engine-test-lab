'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {Compiler}=require('inkjs/full');
const {validatePaths}=require('../packages/story-engine/validate-paths.cjs');
const source='=== start ===\nWelcome.\n* [Help] -> help\n* [Wait] -> wait\n=== help ===\nThank you.\n-> END\n=== wait ===\nMaybe later.\n-> END\n';
test('explores both choices and reaches two endings',()=>{
 const compiled=new Compiler(source).Compile().ToJson();
 const report=validatePaths(compiled,{entry:'start'});
 assert.equal(report.choices,2);
 assert.equal(report.endings,2);
});
test('rejects invalid entry checkpoint',()=>{
 const compiled=new Compiler(source).Compile().ToJson();
 assert.throws(()=>validatePaths(compiled,{entry:'not_there'}),/entry checkpoint/);
});
test('bounded traversal fails safely instead of hanging',()=>{
 const compiled=new Compiler(source).Compile().ToJson();
 assert.throws(()=>validatePaths(compiled,{entry:'start',maxSteps:1}),/limit exceeded/);
});

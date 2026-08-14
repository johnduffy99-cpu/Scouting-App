import test from'node:test';import assert from'node:assert/strict';import{formatClock,liveSeconds,makeEvent}from'../src/model.js';
test('formats a match clock',()=>assert.equal(formatClock(754),'12:34'));
test('calculates a running clock',()=>assert.equal(liveSeconds({seconds:10,running:true,startedAt:1000},6000),15));
test('creates and trims an observation',()=>{const e=makeEvent({player:{id:'p1',name:'A Player',number:8},quality:'Positive',action:'Involvement',detail:'Pass',note:'  sharp pass  ',second:42});assert.equal(e.note,'sharp pass');assert.equal(e.playerId,'p1');assert.ok(e.id)});

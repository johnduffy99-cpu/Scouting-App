import test from 'node:test';
import assert from 'node:assert/strict';
import {startDictation} from '../src/dictation.js';
function harness(options={}){
 const sessions=[],timers=new Map();let id=0,finished=0;
 class Recognition {
  constructor(){sessions.push(this)}
  start(){if(options.throws)throw Error('blocked')}
  stop(){this.stopped=true}
  abort(){this.aborted=true;this.onend?.()}
 }
 const note=new EventTarget();note.value='Typed observation.';note.isConnected=true;
 const classes=new Set();const attrs={};
 const button={disabled:false,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},setAttribute:(k,v)=>attrs[k]=v};
 const status={};const controller=startDictation({Recognition:options.unsupported?null:Recognition,note,button,status,onFinish:()=>finished++,setTimer:(fn,ms)=>{timers.set(++id,{fn,ms});return id},clearTimer:id=>timers.delete(id)});
 const result=(r,entries,index=0)=>r.onresult({resultIndex:index,results:entries.map(([text,final])=>Object.assign([{transcript:text}],{isFinal:final}))});
 const tick=ms=>{for(const [id,t] of [...timers])if(t.ms===ms){timers.delete(id);t.fn()}};
 return {sessions,note,button,status,controller,attrs,classes,timers,result,tick,get finished(){return finished}};
}
test('waits for audio confirmation and configures continuous British English recognition',()=>{
 const h=harness(),r=h.sessions[0];assert.match(h.status.textContent,/Starting microphone/);assert.equal(r.continuous,true);assert.equal(r.lang,'en-GB');assert.equal(r.interimResults,true);assert.equal(h.button.disabled,false);
 r.onaudiostart();assert.match(h.status.textContent,/Listening/);assert.equal(h.attrs['aria-pressed'],'true');h.controller.cancel();
});
test('revised and disappearing interim results do not duplicate or overwrite typed prefix',()=>{
 const h=harness(),r=h.sessions[0];h.result(r,[['Strong first',false]]);h.result(r,[['Strong first touch.',true],['Moves into',false]]);h.result(r,[['Strong first touch.',true],['Moves into space.',true]],1);
 assert.equal(h.note.value,'Typed observation. Strong first touch. Moves into space.');h.result(r,[['Strong first touch.',true]],1);assert.equal(h.note.value,'Typed observation. Strong first touch.');h.controller.cancel();
});
test('stop requests final words before releasing capture',()=>{
 const h=harness(),r=h.sessions[0];h.controller.stop();assert.equal(r.stopped,true);h.result(r,[['Good recovery.',true]]);r.onend();assert.equal(h.controller.active,false);assert.match(h.note.value,/Good recovery/);assert.equal(h.finished,1);assert.equal(h.timers.size,0);
});
test('stop timeout retains interim words and ignores late callbacks',()=>{
 const h=harness(),r=h.sessions[0];h.result(r,[['Late recovery',false]]);h.controller.stop();h.tick(3000);h.result(r,[['Overwrite',true]]);assert.match(h.note.value,/Late recovery$/);assert.match(h.status.textContent,/unconfirmed/);assert.equal(r.aborted,true);
});
test('unexpected service ends restart twice, preserving completed phrases',()=>{
 const h=harness();for(let i=0;i<3;i++){const r=h.sessions[i];h.result(r,[[`Phrase ${i}.`,true]]);r.onend();h.tick(350)}
 assert.equal(h.sessions.length,3);assert.equal(h.controller.active,false);assert.equal(h.note.value,'Typed observation. Phrase 0. Phrase 1. Phrase 2.');assert.equal(h.finished,1);
});
test('no-speech recovery is bounded and never reports success with no captured words',()=>{
 const h=harness();for(let i=0;i<3;i++){h.sessions[i].onerror({error:'no-speech'});h.sessions[i].onend();h.tick(350)}assert.equal(h.controller.active,false);assert.match(h.status.textContent,/No words/);assert.equal(h.status.className,'dictation-status error');
});
for(const code of ['not-allowed','service-not-allowed','audio-capture','network','language-not-supported','aborted'])test(`${code} preserves notes and ends without restart`,()=>{
 const h=harness(),r=h.sessions[0];h.result(r,[['Retained words',false]]);r.onerror({error:code});r.onend();h.tick(350);assert.equal(h.sessions.length,1);assert.equal(h.controller.active,false);assert.equal(h.finished,1);assert.match(h.note.value,/Retained words/);assert.equal(h.status.className,'dictation-status error');
});
test('microphone readiness timeout exits with useful message',()=>{const h=harness();h.tick(12000);assert.match(h.status.textContent,/did not become ready/);assert.equal(h.sessions[0].aborted,true);assert.equal(h.finished,1)});
test('manual typing cancels capture and late recognition cannot replace the edit',()=>{const h=harness(),r=h.sessions[0];h.note.value='My correction';h.note.dispatchEvent(new Event('input'));h.result(r,[['stale text',true]]);assert.equal(h.note.value,'My correction');assert.equal(h.finished,1);assert.equal(r.aborted,true)});
test('cancel on save/navigation leaves visible words and no late writes or restart',()=>{const h=harness(),r=h.sessions[0];h.result(r,[['Good passing',false]]);h.controller.cancel();h.result(r,[['wrong field',true]]);r.onend();h.tick(350);assert.equal(h.note.value,'Typed observation. Good passing');assert.equal(h.finished,1);assert.equal(h.timers.size,0)});
test('cancelling during reconnect prevents a new microphone session',()=>{const h=harness();h.sessions[0].onend();h.controller.cancel();h.tick(350);assert.equal(h.sessions.length,1);assert.equal(h.controller.active,false)});
test('maximum session duration requests a stop',()=>{const h=harness();h.tick(90000);assert.equal(h.sessions[0].stopped,true);h.tick(3000);assert.equal(h.controller.active,false)});
test('synchronous start failure restores microphone control',()=>{const h=harness({throws:true});assert.equal(h.controller.active,false);assert.equal(h.button.disabled,false);assert.equal(h.attrs['aria-pressed'],'false');assert.match(h.status.textContent,/could not start/)});
test('unsupported browsers get a usable fallback',()=>{const h=harness({unsupported:true});assert.equal(h.controller,null);assert.match(h.status.textContent,/keyboard microphone/);assert.equal(h.note.value,'Typed observation.')});

test('active microphone with no returned words times out rather than pretending to capture',()=>{const h=harness();h.sessions[0].onaudiostart();h.tick(15000);assert.match(h.status.textContent,/active but no words/);assert.equal(h.controller.active,false);assert.equal(h.sessions[0].aborted,true)});

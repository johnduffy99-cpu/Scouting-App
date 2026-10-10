import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as model from '../src/model.js';
import * as modes from '../src/assignment-mode.js';
import * as gk from '../src/goalkeeper-workflow.js';
const source=(await readFile(new URL('../src/main.js',import.meta.url),'utf8')).replace(/^import.*\n/gm,'');
function harness(state){
 const store=new Map([['scoutline-sprint1',JSON.stringify(state)]]),app={innerHTML:'',insertAdjacentHTML(){}};
 let sent;
 const ctx=vm.createContext({...model,...modes,...gk,crypto,TextEncoder,Date,JSON,console,clearInterval(){},setInterval(){},clearTimeout(){},setTimeout(){},navigator:{},window:{},alert(message){throw Error(message)},document:{querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},fetch:async(url,request)=>{sent=JSON.parse(request.body);return{ok:true,json:async()=>({pipelineStatus:'Received by SIP',receiptId:'LOCAL-MOCK'})}}});
 vm.runInContext(source,ctx);
 return {run:script=>vm.runInContext(script,ctx),app,store,get sent(){return sent}};
}
function session(){const state={...model.freshState(),match:{home:'Home',away:'Away',competition:'League',venue:'Ground',matchDate:'2026-10-10',assignmentType:modes.GK_ONLY}};modes.addGoalkeeper(state,{name:'Keeper',teamSide:'away'});return state}
test('actual UI renders GK-only setup and capture, restores mode, and switches keepers',()=>{
 const state=session();modes.addGoalkeeper(state,{name:'Other Keeper',teamSide:'home'});const ui=harness(state);
 const live=ui.run('live()');assert.match(live,/GK COACH \/ GK ONLY/);assert.doesNotMatch(live,/id="import-lineup"|id="make-substitution"|id="add-player"/);assert.match(live,/id="start-match"/);
 for(const p of state.players){const panel=ui.run(`selected=${JSON.stringify(p.id)};draftObservation={stage:1,playerId:selected,actions:[]};observationPanel(state.players.find(p=>p.id===selected))`);assert.match(panel,/id="gk-form"/);assert.doesNotMatch(panel,/id="action-form"/);assert.match(panel,new RegExp(p.name));}
 ui.run('save()');const restored=harness(JSON.parse(ui.store.get('scoutline-sprint1')));assert.equal(restored.run('state.match.assignmentType'),modes.GK_ONLY);
});
test('actual submission handler commits one/two GK evidence and retains receipt on reload',async()=>{
 for(const two of [false,true]){const state=session();if(two)modes.addGoalkeeper(state,{name:'Other',teamSide:'home'});state.match.reportStatus='complete';state.clock.period='fulltime';
 const ui=harness(state);await ui.run('submitMatch()');const payload=JSON.parse(ui.sent.source.json);assert.equal(payload.players.length,two?2:1);assert.equal(payload.match.assignment.type,modes.GK_ONLY);
 const restored=harness(JSON.parse(ui.store.get('scoutline-sprint1')));assert.equal(restored.run('state.match.submissionReceipt.receiptId'),'LOCAL-MOCK');}
});

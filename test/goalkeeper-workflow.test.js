import test from 'node:test';
import assert from 'node:assert/strict';
import {goalkeeperActions, goalkeeperAdditionalActions, toggleGoalkeeperAction, goalkeeperSaveDestination, makeGoalkeeperObservation, goalkeeperPanel} from '../src/goalkeeper-workflow.js';
import {createMatchBackup, createStructuredMatchExportV17, scoreFromEvents} from '../src/model.js';
const player={id:'gk1',name:'Neil Stafford',number:'21',goalkeeper:true,teamSide:'home'};
const draft=(actions,stage=1)=>({quality:'Good',bodyPart:'right-hand',actions,stage,note:'Looked to play long early'});
const make=d=>makeGoalkeeperObservation({player,teamName:'Forfar',draft:d,second:1457,period:'first'});
test('approved action sets are exact and complete',()=>{
 assert.deepEqual(goalkeeperActions.map(a=>a.label),['Goal','Save','Parry','Punch','High Ball Claim','Pick Up','Spread','1v1','Other']);
 assert.deepEqual(goalkeeperAdditionalActions.map(a=>a.label),['Distribution','Throw','Kick from Ground','Kick from Hand','Kick in Play','Starting Position','Movement','Handling/Footwork','Strength','Speed','Reaction','Yellow Card','Second Yellow','Straight Red']);
});
test('every ordinary GK action saves from either action page without spatial evidence',()=>{
 for(const action of [...goalkeeperActions,...goalkeeperAdditionalActions].filter(a=>!['save','goal'].includes(a.id))){
  for(const stage of [1,2]){
   const d={...draft([action.id],stage),area:'goal-top-left',shotOrigin:'box-centre'};
   assert.equal(goalkeeperSaveDestination(d),'save');
   const event=make(d);assert.equal(event.saveLocation,'');assert.equal(event.shotOrigin,'');assert.equal(event.goalkeeperOutcome,'');assert.equal(event.area,'defensive-goalmouth');
  }
 }
});
test('Save and Goal route from either page, requiring both valid location selectors',()=>{
 for(const action of ['save','goal']){
  for(const stage of [1,2])assert.equal(goalkeeperSaveDestination(draft([action],stage)),'location');
  assert.equal(goalkeeperSaveDestination(draft([action],3)),'incomplete');
  assert.throws(()=>make(draft([action],3)),/Complete/);
  assert.equal(goalkeeperSaveDestination({...draft([action],3),area:'goal-top-left'}),'incomplete');
  assert.equal(goalkeeperSaveDestination({...draft([action],3),area:'goal-top-left',shotOrigin:'box-centre'}),'save');
 }
});
test('action changes preserve core evidence and clear stale spatial details',()=>{
 const original={...draft(['save'],3),area:'goal-low-right',shotOrigin:'wide-left'};
 const additional=toggleGoalkeeperAction(original,'distribution');
 assert.deepEqual(original.actions,['save']);assert.deepEqual(additional.actions,['save','distribution']);
 const goal=toggleGoalkeeperAction(additional,'goal');assert.deepEqual(goal.actions,['distribution','goal']);
 const ordinary=toggleGoalkeeperAction(goal,'goal');assert.equal(ordinary.area,'');assert.equal(ordinary.shotOrigin,'');assert.equal(ordinary.note,original.note);assert.equal(ordinary.quality,'Good');
});
test('quality, contact and action are required on early saves',()=>{
 for(const d of [{...draft(['punch']),quality:''},{...draft(['punch']),bodyPart:''},draft([])])assert.equal(goalkeeperSaveDestination(d),'incomplete');
});
test('one observation retains all selected actions, note and attribution through JSON, backup and export',()=>{
 const event=make(draft(['punch','distribution','kick-from-hand','starting-position'],2));
 const state={match:{home:'Forfar',away:'Visitors'},players:[player],events:[event],clock:{seconds:1457,period:'first'},lineups:{home:null,away:null}};
 const reloaded=JSON.parse(JSON.stringify(state));assert.deepEqual(reloaded.events[0],event);
 assert.deepEqual(createMatchBackup(reloaded).state.events,[event]);
 const exported=createStructuredMatchExportV17(reloaded).observations[0];
 assert.deepEqual(exported.classification.actions,event.actions);assert.equal(exported.player.id,player.id);assert.equal(exported.notes.original,event.note);
 assert.equal(event.noteMatchSecond,1457);assert.equal(event.period,'first');assert.match(event.comment,/Punch, Distribution, Kick from Hand, Starting Position/);
});
test('GK Goal retains legacy conceded-goal scoring and does not score for the keeper',()=>{
 const event=make({...draft(['goal','distribution'],3),area:'goal-low-right',shotOrigin:'box-centre'});
 assert.equal(event.action,'save');assert.equal(event.goalkeeperOutcome,'goal');assert.deepEqual(scoreFromEvents([event]),{home:0,away:1});assert.doesNotMatch(event.comment,/scored|made a.*save/);
 const saved=make({...draft(['save'],3),area:'goal-middle-centre',shotOrigin:'box-centre'});assert.deepEqual(scoreFromEvents([saved]),{home:0,away:0});
});
test('rendering numbers the conditional page consistently and escapes scout content',()=>{
 for(const stage of [1,2,3]){
  const html=goalkeeperPanel(player,'Forfar',draft(['save'],stage));assert.match(html,new RegExp(`${stage} OF 3`));assert.match(html,/Save to Timeline/);assert.match(html,/Quick Note/);assert.doesNotMatch(html,/6 · Outcome|name="goalkeeperOutcome"/);
 }
 assert.match(goalkeeperPanel(player,'Forfar',draft(['punch'],2)),/2 OF 2/);
 const d=draft(['punch']);d.note='<script>bad</script>';d.stage='saved';d.savedEvent={second:1457,period:'first'};
 const html=goalkeeperPanel(player,'Forfar',d);assert.match(html,/Observation Saved/);assert.match(html,/24:17/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);
});

test('cards retain the existing disciplinary event classification through export',()=>{
 for(const card of ['yellow-card','second-yellow','red-card']){
  const event=make(draft(['distribution',card],2));
  assert.equal(event.type,'disciplinary');assert.equal(event.action,card);
  const exported=createStructuredMatchExportV17({match:{home:'Forfar',away:'Visitors'},players:[player],events:[event]});
  assert.deepEqual(exported.matchEvents[0].actions,['distribution',card]);assert.equal(exported.matchEvents[0].type,'disciplinary');
 }
});

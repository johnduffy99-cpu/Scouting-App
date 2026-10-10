import test from 'node:test';
import assert from 'node:assert/strict';
import {GK_ONLY,addGoalkeeper,setAssignmentType,validateGkOnly,submissionReadiness} from '../src/assignment-mode.js';
import {freshState,matchStartReadiness,createMatchBackup,createStructuredMatchExportV17,createEvidencePackage} from '../src/model.js';
import {makeGoalkeeperObservation} from '../src/goalkeeper-workflow.js';
const session=()=>({...freshState(),match:{home:'Home',away:'Away',assignmentType:GK_ONLY,competition:'League',venue:'Ground',matchDate:'2026-10-10'}});
for(const sides of [['home'],['away'],['home','away']])test(`${sides.join('/')} GK: start, observations, ratings, backup, resume and commit`,async()=>{
 const state=session();
 for(const teamSide of sides){const p=addGoalkeeper(state,{name:`${teamSide} Keeper`,teamSide});p.rating=8;p.strengths=['Handling'];state.events.push(makeGoalkeeperObservation({player:p,teamName:state.match[teamSide],draft:{quality:'Good',bodyPart:'both-hands',actions:['distribution'],stage:1,note:'Accurate distribution'},second:123,period:'first'}));}
 assert.equal(matchStartReadiness(state).ready,true);
 const resumed=JSON.parse(JSON.stringify(createMatchBackup(state))).state;
 assert.deepEqual(resumed,state);assert.equal(matchStartReadiness(resumed).ready,true);
 await assert.rejects(createEvidencePackage(resumed),/closing report/);
 resumed.clock={...resumed.clock,seconds:123,period:'fulltime'};resumed.match.reportStatus='complete';
 const data=JSON.parse((await createEvidencePackage(resumed)).source.json);
 assert.equal(data.match.assignment.type,GK_ONLY);assert.equal(data.players.length,sides.length);
 assert.equal(data.observations.length,sides.length);assert.equal(data.players[0].rating,8);
 assert.equal(data.observations[0].matchSecond,123);assert.equal(data.observations[0].player.id,state.players[0].id);
 assert.equal(data.lineups.home,null);assert.ok(!data.dataQuality.notes.some(n=>/line-up|Formation|Tactical|shirt number/.test(n)));
});
test('rejects missing, duplicate-side, outfield and malformed GK assignments',async()=>{
 const state=session();assert.equal(validateGkOnly(state).ready,false);
 assert.throws(()=>addGoalkeeper(state,{name:' ',teamSide:'home'}));
 addGoalkeeper(state,{name:'Keeper',teamSide:'home'});
 assert.throws(()=>addGoalkeeper(state,{name:'Other',teamSide:'home'}));
 state.players.push({...state.players[0],id:'other'});state.match.reportStatus='complete';
 assert.equal(submissionReadiness(state).ready,false);await assert.rejects(createEvidencePackage(state),/one or two/);
 state.players[1].teamSide='away';state.players[1].goalkeeper=false;assert.equal(validateGkOnly(state).ready,false);
});
test('switching assignment preserves evidence and rejects full squads without data loss',()=>{
 const state=session();addGoalkeeper(state,{name:'Keeper',teamSide:'away'});const players=JSON.stringify(state.players);
 setAssignmentType(state,'scouting-general');assert.equal(matchStartReadiness(state).code,'positions-unconfirmed');
 setAssignmentType(state,GK_ONLY);assert.equal(matchStartReadiness(state).ready,true);assert.equal(JSON.stringify(state.players),players);
 setAssignmentType(state,'scouting-general');state.players.push({id:'outfield',name:'Outfield',teamSide:'home',position:'MID'});
 const before=JSON.stringify(state);assert.throws(()=>setAssignmentType(state,GK_ONLY),/Full Match/);assert.equal(JSON.stringify(state),before);
});
test('Full Match keeps existing lineup, placement and export behaviour',()=>{
 const state=session();state.match.assignmentType='scouting-general';addGoalkeeper({...state,match:{...state.match,assignmentType:GK_ONLY}},{name:'Keeper',teamSide:'home'});
 state.lineups.home={starters:[]};assert.equal(matchStartReadiness(state).code,'lineups-incomplete');
 state.lineups.away={starters:[]};assert.equal(matchStartReadiness(state).code,'positions-unconfirmed');state.match.placementConfirmed=true;assert.equal(matchStartReadiness(state).ready,true);
 assert.ok(createStructuredMatchExportV17(state).dataQuality.notes.includes('Formation notes were not recorded.'));
});

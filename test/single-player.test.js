import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseOtherPlayerNames,mergeSinglePlayerSquad,submissionReadiness} from '../src/assignment-mode.js';
import {freshState,matchStartReadiness,makeEvent,makeQuickNoteEvent,createPitchCaptureEvent,createMatchBackup,createStructuredMatchExportV17,createAiHandoffReportV17,createEvidencePackage} from '../src/model.js';
const session=()=>({...freshState(),match:{home:'Youth Home',away:'Youth Away',competition:'Youth',venue:'Park',matchDate:'2026-11-04',assignmentType:'scouting-player',otherPlayerNames:'pending'},players:[{id:'target',name:'Target Player',number:'',teamSide:'away',position:'MID',target:true,squadRole:'starter',x:32,y:40,rating:8,strengths:['Passing'],developmentAreas:['Heading']}]});
for(const choice of ['skip','add'])for(const count of [0,1,2])test(`${choice}: ${count} team sheets retain target evidence through start, restore, export and submission`,async()=>{
 const state=session();assert.equal(matchStartReadiness(state).code,'names-choice-required');
 chooseOtherPlayerNames(state,choice);
 for(const side of ['home','away'].slice(0,count))state.lineups[side]={team:state.match[side],starters:[{name:'Known Player',number:'2'}],substitutes:[]};
 state.match.deployment={stage:count?'team2':'team1'};
 assert.equal(matchStartReadiness(state).code,'positions-unconfirmed');state.match.placementConfirmed=true;assert.equal(matchStartReadiness(state).ready,true);
 const p=state.players[0];state.events.push(makeEvent({player:p,teamName:state.match.away,quality:'Good',bodyPart:'right-foot',action:'pass',second:85,note:'Found space'}));
 state.events.push(makeQuickNoteEvent({player:p,teamName:state.match.away,scope:'player',note:'Tracked runner',second:90}));state.events.push(createPitchCaptureEvent(state));
 const restored=JSON.parse(JSON.stringify(createMatchBackup(state))).state;assert.deepEqual(restored,state);
 const data=createStructuredMatchExportV17(restored);assert.equal(data.players.length,1);assert.equal(data.players[0].rating,8);assert.deepEqual(data.players[0].strengths,['Passing']);assert.equal(data.observations[0].player.id,'target');assert.equal(data.observations[0].matchSecond,85);assert.equal(data.matchEvents[0].coordinates.length,1);assert.equal(data.matchEvents[0].coordinates[0].x,32);assert.equal(data.match.assignment.otherPlayerNames,choice);
 const report=createAiHandoffReportV17(restored);assert.match(report,/Target Player/);assert.match(report,/Tracked runner/);assert.match(report,/Other player names:/);
 assert.equal(submissionReadiness(restored).ready,false);await assert.rejects(createEvidencePackage(restored),/closing report/);
 restored.match.reportStatus='complete';restored.clock.period='fulltime';const pkg=await createEvidencePackage(restored);assert.equal(JSON.parse(pkg.source.json).players.length,1);
});
test('choices reject missing or multiple targets without mutation',()=>{
 for(const players of [[],[{id:'bad',name:' ',teamSide:'home',target:true}],[...session().players,{id:'second',name:'Second',target:true,teamSide:'home'}]]){const state={...session(),players},before=JSON.stringify(state);assert.throws(()=>chooseOtherPlayerNames(state,'skip'));assert.equal(JSON.stringify(state),before);}
});
test('lineup merge retains target identity and assessments, preserves uncertain matches',()=>{
 const state=session();chooseOtherPlayerNames(state,'add');const target=state.players[0];
 const squad=[{id:'new',name:target.name,number:'7',teamSide:'away',imported:true},{id:'other',name:'Known teammate',teamSide:'away'}];
 const merged=mergeSinglePlayerSquad(state,squad,'away');assert.equal(merged.length,2);assert.equal(merged[0].id,'target');assert.equal(merged[0].rating,8);assert.equal(merged[0].target,true);assert.equal(merged[0].x,32);assert.equal(merged[0].number,'7');
 assert.deepEqual(mergeSinglePlayerSquad(state,squad,'home'),squad);assert.deepEqual(mergeSinglePlayerSquad(state,[...squad,{...squad[0],id:'ambiguous'}],'away'),[...squad,{...squad[0],id:'ambiguous'}]);
});
test('legacy player scouting still requires both sheets when one is imported',()=>{const state=session();delete state.match.otherPlayerNames;state.lineups.home={starters:[]};state.match.placementConfirmed=true;assert.equal(matchStartReadiness(state).code,'lineups-incomplete')});

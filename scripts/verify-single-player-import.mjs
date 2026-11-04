// Read-only compatibility check against a supplied FIP checkout. No database/provider calls.
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {freshState,makeEvent,createStructuredMatchExportV17} from '../src/model.js';
const root=resolve(process.argv[2]);
const ts=createRequire(resolve(root,'package.json'))('typescript');
const compile=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpile(source,{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022})).toString('base64');
const evidence=compile(await readFile(resolve(root,'lib/evidence.ts'),'utf8'));
const identity=compile(await readFile(resolve(root,'lib/identity-resolution.ts'),'utf8'));
const importer=compile((await readFile(resolve(root,'lib/import-match.ts'),'utf8')).replace('from "./evidence"',`from "${evidence}"`).replace('from "./identity-resolution"',`from "${identity}"`));
const {importMatchExport}=await import(importer);
for(const choice of ['skip','add'])for(const sides of [[],['home'],['home','away']]){
 const p={id:'target',name:'Test Target',teamSide:'away',target:true,number:'',rating:8,squadRole:'starter',x:32,y:40};
 const state={...freshState(),match:{home:'Test Home',away:'Test Away',competition:'Youth',venue:'Park',matchDate:'2026-11-04',assignmentType:'scouting-player',otherPlayerNames:choice,reportStatus:'complete'},players:[p]};
 for(const side of sides)state.lineups[side]={starters:[],substitutes:[]};
 state.events.push(makeEvent({player:p,teamName:'Test Away',quality:'Good',bodyPart:'right-foot',action:'pass',second:85}));
 const exported=createStructuredMatchExportV17(state);const bytes=new TextEncoder().encode(JSON.stringify(exported));
 const result=await importMatchExport(bytes.buffer,'single-player.json');
 assert.equal(result.validation.status,'passed',JSON.stringify(result.validation));assert.equal(result.players.length,1);assert.equal(result.players[0].name,p.name);assert.equal(result.players[0].rating,8);assert.equal(result.observations[0].playerId,'target');assert.equal(result.match.assignment.type,'scouting-player');
 console.log(`${choice}, ${sides.length} sheets: importer validation passed; exactly one real player`);
}

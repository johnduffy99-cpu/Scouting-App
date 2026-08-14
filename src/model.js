export const qualities=['Great','Good','Reasonable','Poor'];
const icon=path=>`<svg viewBox="0 0 32 32" aria-hidden="true">${path}</svg>`;
export const bodyParts=[
 {id:'left-foot',label:'Left foot',icon:icon('<path d="M22 5c-3 3-5 7-5 11l-7 3c-4 2-3 7 1 8 6 1 12-2 14-7 2-5 1-11-3-15Z"/><path d="m17 16 6 3"/>')},
 {id:'right-foot',label:'Right foot',icon:icon('<g transform="translate(32 0) scale(-1 1)"><path d="M22 5c-3 3-5 7-5 11l-7 3c-4 2-3 7 1 8 6 1 12-2 14-7 2-5 1-11-3-15Z"/><path d="m17 16 6 3"/></g>')},
 {id:'header',label:'Head',icon:icon('<circle cx="16" cy="11" r="6"/><path d="M9 28c1-6 3-9 7-9s6 3 7 9"/>')},
 {id:'hand',label:'Hand',icon:icon('<path d="M9 15V8m4 7V5m4 10V4m4 12V7m-12 8-3-3c-2-2-5 1-3 3l7 10c2 3 5 4 8 3 4-1 6-5 6-9v-6"/>')},
 {id:'na',label:'N/A',icon:icon('<path d="M6 6l20 20"/><circle cx="16" cy="16" r="11"/>')}
];
export const actions=[
 {id:'shot',label:'Shot',icon:icon('<circle cx="14" cy="17" r="9"/><circle cx="14" cy="17" r="3"/><path d="m20 10 7-7m-5 0h5v5"/>')},
 {id:'pass',label:'Pass',icon:icon('<path d="M5 24 25 7m-8 0h8v8"/>')},
 {id:'cross',label:'Cross',icon:icon('<path d="M4 24C12 24 11 8 25 8m-7-5 7 5-6 6"/>')},
 {id:'header',label:'Header',icon:icon('<circle cx="18" cy="10" r="7"/><path d="M6 29c0-7 3-11 8-11m-2-13 3 3 4-1 2 4-2 4"/>')},
 {id:'tackle',label:'Tackle',icon:icon('<path d="m16 3 11 5v8c0 7-5 11-11 14C10 27 5 23 5 16V8l11-5Z"/>')},
 {id:'intercept',label:'Intercept',icon:icon('<path d="M5 25 27 7M4 7l24 18"/>')},
 {id:'dribble',label:'Dribble',icon:icon('<path d="M3 23c5-13 8 9 13-4S23 9 29 7m-5-3 5 3-2 6"/>')},
 {id:'clearance',label:'Clearance',icon:icon('<path d="M5 23c7 1 11-3 13-10m-7 2 8-2-1 8"/><circle cx="6" cy="24" r="2"/>')},
 {id:'save',label:'Save',icon:icon('<path d="M8 17V9m4 7V6m4 10V5m4 12V8m-12 8-3-3c-2-2-5 1-3 3l7 9c2 3 5 4 8 3 4-1 6-5 6-9v-5"/>')},
 {id:'foul-won',label:'Foul won',icon:icon('<path d="M8 28V4m1 2h15l-4 5 4 5H9"/>')},
 {id:'foul',label:'Foul',icon:icon('<circle cx="16" cy="18" r="8"/><path d="M16 10V5m-5 6L7 7m14 4 4-4"/>')},
 {id:'other',label:'Other',icon:icon('<circle cx="7" cy="16" r="1"/><circle cx="16" cy="16" r="1"/><circle cx="25" cy="16" r="1"/><circle cx="16" cy="16" r="13"/>')}
];
export const areas=[{id:'attacking-goalmouth',label:'Attacking goalmouth'},{id:'attacking-left',label:'Attacking left'},{id:'attacking-centre',label:'Attacking centre'},{id:'attacking-right',label:'Attacking right'},{id:'midfield-left',label:'Midfield left'},{id:'midfield-centre',label:'Midfield centre'},{id:'midfield-right',label:'Midfield right'},{id:'defensive-left',label:'Defensive left'},{id:'defensive-centre',label:'Defensive centre'},{id:'defensive-right',label:'Defensive right'},{id:'defensive-goalmouth',label:'Defensive goalmouth'}];
export const freshState=()=>({match:null,players:[],events:[],lineups:{home:null,away:null},clock:{seconds:0,running:false,startedAt:null}});
export function formatClock(seconds){const s=Math.max(0,Math.floor(seconds));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
export function liveSeconds(clock,now=Date.now()){return clock.seconds+(clock.running?Math.floor((now-clock.startedAt)/1000):0)}
export function makeEvent({player,teamName='',quality,bodyPart='',action,area='',note='',comment='',second}){const generatedComment=generateObservationSentence({playerName:player.name,quality,bodyPart,action,area,note});return{id:crypto.randomUUID(),playerId:player.id,playerName:player.name,number:player.number,teamName,teamSide:player.teamSide||'',quality,bodyPart,action,area,note:note.trim(),generatedComment,comment:(comment||generatedComment).trim(),second,createdAt:Date.now()}}
export function generateObservationSentence({playerName,quality,bodyPart,action,area,note=''}){const surname=playerName.trim().split(/\s+/).at(-1)||'The player';const q=(quality||'').toLowerCase();const body=bodyPart==='left-foot'?'left-footed':bodyPart==='right-foot'?'right-footed':'';const place=areaPhrase(area);const descriptor=[q,body].filter(Boolean).join(' ');const templates={shot:`${surname} produced a ${descriptor} shot${place}.`,pass:`${surname} played a ${descriptor} pass${place}.`,cross:`${surname} delivered a ${descriptor} cross${place}.`,header:`${surname} produced a ${q} header${place}.`,tackle:`${surname} made a ${q} tackle${place}.`,intercept:`${surname} made a ${q} interception${place}.`,dribble:`${surname} made a ${q} dribble${place}.`,clearance:`${surname} made a ${descriptor} clearance${place}.`,save:`${surname} made a ${q} save${place}.`,'foul-won':`${surname} did ${q} work to win a foul${place}.`,foul:`${surname} committed a ${q} foul${place}.`,other:`${surname} produced a ${q} action${place}.`};const base=(templates[action]||`${surname} produced a ${q} action${place}.`).replace(/\s+/g,' ').replace('a shot','a shot').trim();const extra=normaliseNote(note);return extra?`${base} ${extra}`:base}
function areaPhrase(area){return{goalmouth:' in the attacking goalmouth','attacking-goalmouth':' in the attacking goalmouth','attacking-left':' on the left side of the attacking third','attacking-centre':' in the centre of the attacking third','attacking-right':' on the right side of the attacking third','midfield-left':' on the left side of midfield','midfield-centre':' in central midfield','midfield-right':' on the right side of midfield','defensive-left':' on the left side of the defensive third','defensive-centre':' in the centre of the defensive third','defensive-right':' on the right side of the defensive third','defensive-goalmouth':' in the defensive goalmouth'}[area]||''}
function normaliseNote(note){const value=note.trim();if(!value)return'';const sentence=value.charAt(0).toUpperCase()+value.slice(1);return/[.!?]$/.test(sentence)?sentence:`${sentence}.`}
const headings={team:'team',opponent:'opponent','match date':'matchDate',status:'status',source:'source','source url':'sourceUrl',published:'published','starting xi':'starters',starters:'starters',substitutes:'substitutes',subs:'substitutes',uncertainties:'uncertainties'};
export function parseLineupBlock(text){
 const result={team:'',opponent:'',matchDate:'',status:'',source:'',sourceUrl:'',published:'',starters:[],substitutes:[],uncertainties:[]};let section='';
 for(const raw of text.split(/\r?\n/)){const line=raw.trim();if(!line)continue;const match=line.match(/^([^:]+):\s*(.*)$/);if(match&&headings[match[1].trim().toLowerCase()]){section=headings[match[1].trim().toLowerCase()];const value=match[2].trim();if(['starters','substitutes','uncertainties'].includes(section)){if(value&&value.toLowerCase()!=='none')section==='uncertainties'?result.uncertainties.push(value):result[section].push(parsePlayer(value))}else result[section]=value;continue}if(section==='starters'||section==='substitutes')result[section].push(parsePlayer(line));else if(section==='uncertainties'&&line.toLowerCase()!=='none')result.uncertainties.push(line.replace(/^[-•]\s*/,''));
 }
 result.starters=result.starters.filter(p=>p.name);result.substitutes=result.substitutes.filter(p=>p.name);return result;
}
function parsePlayer(line){const clean=line.replace(/^[-•]\s*/,'').trim();const pipe=clean.match(/^(\d{1,2}|\?)\s*[|–—-]\s*(.+)$/);const spaced=clean.match(/^(\d{1,2}|\?)\.?\s+(.+)$/);const match=pipe||spaced;return match?{number:match[1]==='?'?'':match[1],name:match[2].trim()}:{number:'',name:clean}}
export function lineupWarnings(lineup){const warnings=[];if(!lineup.team)warnings.push('Team name is missing');if(!lineup.source)warnings.push('Official source is missing');if(!lineup.sourceUrl)warnings.push('Source URL is missing');if(lineup.starters.length!==11)warnings.push(`Starting XI contains ${lineup.starters.length} players`);if(lineup.starters.some(p=>!p.number))warnings.push('One or more starters have no shirt number');if(lineup.uncertainties.length)warnings.push(`${lineup.uncertainties.length} uncertainty note${lineup.uncertainties.length===1?'':'s'} to review`);return warnings}

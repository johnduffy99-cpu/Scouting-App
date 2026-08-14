export const actions={Involvement:['Pass','Carry','Cross','Shot'],Defending:['Duel','Interception','Tackle','Header'],Positioning:['Movement','Shape','Transition','Press'],Mindset:['Composure','Decision','Work rate','Communication']};
export const qualities=['Positive','Neutral','Negative'];
export const freshState=()=>({match:null,players:[],events:[],clock:{seconds:0,running:false,startedAt:null}});
export function formatClock(seconds){const s=Math.max(0,Math.floor(seconds));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
export function liveSeconds(clock,now=Date.now()){return clock.seconds+(clock.running?Math.floor((now-clock.startedAt)/1000):0)}
export function makeEvent({player,quality,action,detail,note,second}){return{id:crypto.randomUUID(),playerId:player.id,playerName:player.name,number:player.number,quality,action,detail,note:note.trim(),second,createdAt:Date.now()}}

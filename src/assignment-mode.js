export const GK_ONLY = 'goalkeeper-only';
export const isGkOnly = state => state?.match?.assignmentType === GK_ONLY;
export function validateGkOnly(state) {
 const players = state?.players || [];
 const valid = players.length >= 1 && players.length <= 2 && players.every(p => p.id && String(p.name || '').trim() && p.goalkeeper === true && p.position === 'GK' && ['home','away'].includes(p.teamSide)) && new Set(players.map(p => p.teamSide)).size === players.length && new Set(players.map(p => p.id)).size === players.length;
 return {ready:valid, code:valid?'ready':'goalkeepers-invalid', message:valid?'Ready to observe goalkeepers.':'Enter one or two named goalkeepers, with at most one in each home/away slot.'};
}
export function setAssignmentType(state, type) {
 if(type === GK_ONLY) {
  const check = validateGkOnly(state);
  if(!check.ready) throw new Error(check.message + ' Use Full Match with a goalkeeper-specific assignment for full squads.');
 }
 state.match.assignmentType = type;
}
export function addGoalkeeper(state, {name, number='', teamSide}) {
 if(!isGkOnly(state) || !String(name || '').trim() || !['home','away'].includes(teamSide) || state.players.some(p=>p.teamSide===teamSide)) throw new Error('Choose an empty home/away goalkeeper slot and enter a name.');
 const player={id:crypto.randomUUID(),name:name.trim(),number:String(number).trim(),teamSide,position:'GK',goalkeeper:true,target:true,initialSquadRole:'starter',squadRole:'starter',teamColor:teamSide==='home'?'#ef4444':'#2563eb',x:50,y:teamSide==='home'?92:8};
 state.players.push(player);
 return player;
}
export function submissionReadiness(state) {
 if(isSinglePlayer(state)) {const check=validateSinglePlayer(state);if(!check.ready)return check;}
 if(isGkOnly(state)) {const check=validateGkOnly(state);if(!check.ready)return check;}
 return {ready:state?.match?.reportStatus==='complete',message:'Complete the closing report before submitting.'};
}

// Explicit opt-in: legacy player assignments retain their existing setup gates.
export const isSinglePlayer = state => state?.match?.assignmentType === 'scouting-player' && ['add','skip'].includes(state.match.otherPlayerNames);
export function validateSinglePlayer(state) {
 const targets=(state?.players||[]).filter(p=>p.target);
 const ready=targets.length===1 && Boolean(targets[0].id && String(targets[0].name||'').trim() && ['home','away'].includes(targets[0].teamSide));
 return {ready,code:ready?'ready':'target-invalid',message:ready?'Ready to scout the target player.':'Identify one named target player and their team.'};
}
export function chooseOtherPlayerNames(state, choice) {
 if(state?.match?.assignmentType!=='scouting-player'||!['add','skip'].includes(choice))throw new Error('Choose whether to add other player names.');
 const check=validateSinglePlayer(state);if(!check.ready)throw new Error(check.message);
 state.match.otherPlayerNames=choice;
}
// Preserve the target ID, assessments and coordinates when their team is imported.
export function mergeSinglePlayerSquad(state, squad, side) {
 const target=state.players.find(p=>p.target&&p.teamSide===side);
 if(!target)return squad;
 const matches=squad.filter(p=>p.name.trim().toLowerCase()===target.name.trim().toLowerCase()&&(!target.number||!p.number||String(p.number)===String(target.number)));
 if(matches.length!==1)return squad;
 return squad.map(p=>p===matches[0]?{...p,...target,number:target.number||p.number,imported:true}:p);
}

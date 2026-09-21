import {actions, goalkeeperSaveAction, qualities, goalkeeperBodyParts, goalAreas, shotOriginAreas, makeEvent, formatMatchClock} from './model.js';

const svg = path => `<svg viewBox="0 0 32 32" aria-hidden="true">${path}</svg>`;
const existing = id => actions.find(action => action.id === id) || (id === 'save' ? goalkeeperSaveAction : undefined);
const choice = (id, label, path) => ({id, label, icon: svg(path)});
export const goalkeeperActions = [
 existing('goal'), existing('save'), {...existing('save'), id:'parry', label:'Parry'},
 choice('punch','Punch','<path d="m9 27 5-9-5-5 3-7 4 2 3-4 7 6-2 8-6 3-4 8M14 10l7 5m-5-8 7 5"/>'),
 choice('high-ball-claim','High Ball Claim','<circle cx="16" cy="5" r="3"/><path d="m4 25 4-13 4-3 2 8-4 8m18 0-4-13-4-3-2 8 4 8"/>'),
 choice('pick-up','Pick Up','<circle cx="22" cy="22" r="4"/><path d="M5 23h10l4-6-6-2-6 2m2-10 10-1 7 7"/>'),
 choice('spread','Spread','<circle cx="22" cy="7" r="3"/><path d="m17 12-7 3-7-3m14 0 6 5 6-3m-12-2-4 8-8 6m8-6 10 6"/>'),
 choice('one-v-one','1v1','<circle cx="12" cy="6" r="3"/><path d="m10 12 8 2 3 7m-11-9-5 8m7-5-4 13m6-9 4 9"/><circle cx="26" cy="25" r="3"/>'),
 existing('other')
];
export const goalkeeperAdditionalActions = [
 choice('distribution','Distribution','<path d="M4 16h24m-8-8 8 8-8 8"/>'),
 choice('throw','Throw','<circle cx="18" cy="7" r="3"/><circle cx="27" cy="4" r="2"/><path d="m16 12 8-5m-8 5-8 5m8-5-4 10-7 6m8-6 7 6"/>'),
 {...goalkeeperBodyParts[3],id:'kick-from-ground',label:'Kick from Ground'},
 choice('kick-from-hand','Kick from Hand','<circle cx="22" cy="8" r="3"/><path d="m17 13-8 8H3v6h14l4-9 5 4m-9-9 6 1"/>'),
 choice('kick-in-play','Kick in Play','<circle cx="16" cy="16" r="12"/><path d="m16 4 4 9 8 3-8 4-4 8-4-8-8-4 8-3Zm-4 9 8 7m0-7-8 7"/>'),
 choice('starting-position','Starting Position','<path d="M16 29S6 18 6 11a10 10 0 0 1 20 0c0 7-10 18-10 18Z"/><circle cx="16" cy="11" r="3"/>'),
 {...existing('run'),id:'movement',label:'Movement'},
 choice('handling-footwork','Handling/Footwork','<ellipse cx="10" cy="10" rx="4" ry="7"/><ellipse cx="22" cy="20" rx="4" ry="7"/><path d="m7 21 5 2m7-18 5 2"/>'),
 choice('strength','Strength','<path d="M3 11v10m5-15v20m16-20v20m5-15v10M8 16h16"/>'),
 choice('speed','Speed','<path d="M3 10h12M3 16h16M3 22h12m7-16 9 10-9 10"/>'),
 choice('reaction','Reaction','<circle cx="16" cy="18" r="10"/><path d="M16 18V11m-4-8h8m-4 0v5m8 1 3-3"/>'),
 choice('yellow-card','Yellow Card','<rect x="7" y="3" width="18" height="26" rx="2" fill="#facc15" stroke="#eab308"/>'),
 choice('second-yellow','Second Yellow','<path d="M2 5h12v22H2Zm16 0h12v22H18Z" fill="#facc15" stroke="#eab308"/>'),
 choice('red-card','Straight Red','<rect x="7" y="3" width="18" height="26" rx="2" fill="#ef4444" stroke="#dc2626"/>')
];
const allActions = [...goalkeeperActions, ...goalkeeperAdditionalActions];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const needsGoalkeeperLocation = draft => (draft.actions || []).some(id => ['save','goal'].includes(id));
export const canSaveGoalkeeper = draft => qualities.includes(draft.quality) && goalkeeperBodyParts.some(p => p.id === draft.bodyPart) && (draft.actions || []).some(id => allActions.some(a => a.id === id));
export function toggleGoalkeeperAction(draft, id) {
 if (!allActions.some(a => a.id === id)) return draft;
 let selected = [...(draft.actions || [])];
 if (selected.includes(id)) selected = selected.filter(item => item !== id);
 else {
  // A single observation has one spatial outcome and one disciplinary decision.
  const exclusive = ['goal','save'].includes(id) ? ['goal','save'] : ['yellow-card','second-yellow','red-card'].includes(id) ? ['yellow-card','second-yellow','red-card'] : [];
  selected = selected.filter(item => !exclusive.includes(item));
  selected.push(id);
 }
 const next = {...draft, actions:selected};
 if (!needsGoalkeeperLocation(next)) { next.area = ''; next.shotOrigin = ''; }
 return next;
}
export function goalkeeperSaveDestination(draft) {
 if (!canSaveGoalkeeper(draft)) return 'incomplete';
 if (needsGoalkeeperLocation(draft) && draft.stage !== 3) return 'location';
 if (needsGoalkeeperLocation(draft) && (!goalAreas.some(a => a.id === draft.area) || !shotOriginAreas.some(a => a.id === draft.shotOrigin))) return 'incomplete';
 return 'save';
}
export function makeGoalkeeperObservation({player, teamName, draft, second, period}) {
 if (goalkeeperSaveDestination(draft) !== 'save') throw new Error('Complete the goalkeeper observation before saving.');
 const selected = [...draft.actions], spatial = needsGoalkeeperLocation(draft), goal = selected.includes('goal');
 // Keep the existing conceded-goal representation so legacy scoring/imports remain compatible.
 const card = selected.find(id => ['yellow-card','second-yellow','red-card'].includes(id));
 const action = spatial ? 'save' : card || selected[0];
 const event = makeEvent({player, teamName, quality:draft.quality, bodyPart:draft.bodyPart, action,
  area:spatial ? draft.area : 'defensive-goalmouth', saveLocation:spatial ? draft.area : '',
  shotOrigin:spatial ? draft.shotOrigin : '', goalkeeperOutcome:spatial ? (goal ? 'goal' : 'save') : '', note:draft.note || '', second});
 const label = (items, id) => items.find(item => item.id === id)?.label || id;
 const details = [`${player.name} — ${draft.quality}; ${label(goalkeeperBodyParts,draft.bodyPart)}.`,
  `Actions: ${selected.map(id => label(allActions,id)).join(', ')}.`,
  goal ? 'Goal conceded.' : '', spatial ? `Save/Goal location: ${label(goalAreas,draft.area)}. Shot origin: ${label(shotOriginAreas,draft.shotOrigin)}.` : '', (draft.note || '').trim()].filter(Boolean).join(' ');
 return {...event, ...(card ? {type:'disciplinary'} : {}), actions:selected, goalkeeperObservation:true, period, generatedComment:details, comment:details};
}
const title = (player,teamName) => `<div class="player-title"><span>${esc(player.number)}</span><div><small>${esc(teamName)} · GOALKEEPER</small><h2>${esc(player.name)}</h2></div></div>`;
const actionGrid = (choices,draft) => `<div class="action-grid">${choices.map(a => `<label><input type="checkbox" name="gkAction" value="${a.id}" ${(draft.actions || []).includes(a.id)?'checked':''}><span><i>${a.icon}</i>${esc(a.label)}</span></label>`).join('')}</div>`;
export function goalkeeperPanel(player, teamName, draft) {
 const stage = draft.stage || 1;
 if (stage === 'saved') return `<div class="panel-wrap"><section class="panel gk-panel gk-complete"><div class="handle"></div><button type="button" class="close-panel" aria-label="Close">×</button><div class="panel-step">GK OBSERVATION COMPLETE</div>${title(player,teamName)}<div class="gk-checkmark" aria-hidden="true">✓</div><h2>Observation Saved</h2><p>Added to timeline at ${esc(formatMatchClock(draft.savedEvent.second,draft.savedEvent.period))}</p><button type="button" class="primary" id="gk-another">Add Another Observation</button><button type="button" id="gk-close">Close</button><section class="gk-recorded"><h3>Recorded Details</h3><dl>${[['Player',`${player.name} (${player.number})`],['Quality',draft.quality],['Contact',goalkeeperBodyParts.find(p=>p.id===draft.bodyPart)?.label],['Actions',(draft.actions||[]).map(id=>allActions.find(a=>a.id===id)?.label).join(', ')],...(needsGoalkeeperLocation(draft)?[['Save/Goal Location',goalAreas.find(a=>a.id===draft.area)?.label],['Shot Origin',shotOriginAreas.find(a=>a.id===draft.shotOrigin)?.label]]:[]),['Note',draft.note||'—']].map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section></section></div>`;
 const total = needsGoalkeeperLocation(draft) ? 3 : 2;
 const core = `<fieldset><legend>1 · Quality</legend><div class="quality-grid">${qualities.map(q=>`<label class="quality-${q.toLowerCase()}"><input type="radio" name="quality" value="${q}" ${draft.quality===q?'checked':''}><span>${q}</span></label>`).join('')}</div></fieldset><fieldset><legend>2 · Contact</legend><div class="body-grid goalkeeper-parts">${goalkeeperBodyParts.map(p=>`<label><input type="radio" name="bodyPart" value="${p.id}" ${draft.bodyPart===p.id?'checked':''}><span><i>${p.icon}</i>${p.label}</span></label>`).join('')}</div></fieldset><fieldset><legend>3 · Actions · select one or more</legend>${actionGrid(goalkeeperActions,draft)}</fieldset>`;
 const location = `<p class="gk-info">Complete location details for a Save or Goal.</p><fieldset><legend>1 · Save/Goal Location</legend><div class="goal-zone" aria-label="Save/Goal Location">${goalAreas.map(a=>`<label><input type="radio" name="area" value="${a.id}" ${draft.area===a.id?'checked':''} required><span>${a.label}</span></label>`).join('')}</div></fieldset><fieldset><legend>2 · Shot Origin</legend><div class="shot-origin" aria-label="Shot Origin"><div class="shot-goal"></div>${shotOriginAreas.map(a=>`<label class="shot-${a.id}"><input type="radio" name="shotOrigin" value="${a.id}" ${draft.shotOrigin===a.id?'checked':''} required><span>${a.label}</span></label>`).join('')}</div></fieldset>`;
 return `<div class="panel-wrap"><form class="panel gk-panel" id="gk-form"><div class="handle"></div><button type="button" class="close-panel" aria-label="Close">×</button>${stage>1?'<button type="button" class="gk-back">‹ Back</button>':''}<div class="panel-step">${stage===3?'GK LOCATION':'GOALKEEPER OBSERVATION'} · ${stage} OF ${total}</div>${title(player,teamName)}${stage===1?core:stage===2?`<fieldset><legend>Additional actions or attributes</legend><p class="helper">Select one or more</p>${actionGrid(goalkeeperAdditionalActions,draft)}</fieldset>`:location}<div class="gk-controls">${stage===1?'<button type="button" id="gk-additional">Additional Actions · Page 2 ›</button>':''}<button class="primary" id="gk-save" ${canSaveGoalkeeper(draft)?'':'disabled'}>Save to Timeline</button><button type="button" class="gk-quick-note" id="gk-note">Quick Note<small>TYPE OR DICTATE</small></button></div><div class="gk-note-editor" ${draft.noteOpen?'':'hidden'}><label class="notes-label">Quick Note<div class="note-box"><textarea name="note" placeholder="Add note…">${esc(draft.note || '')}</textarea><button type="button" id="dictate" aria-label="Start dictating note">●</button></div></label><span class="dictation-status" id="dictation-status" role="status">Tap the microphone to dictate</span></div><p id="gk-error" role="alert">${esc(draft.error || '')}</p></form></div>`;
}

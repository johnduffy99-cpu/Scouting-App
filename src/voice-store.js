const NAME='scoutline-voice-recordings';
function open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(NAME,1);r.onupgradeneeded=()=>r.result.createObjectStore('recordings',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function run(mode,operation){const db=await open();return new Promise((resolve,reject)=>{let result;const tx=db.transaction('recordings',mode);const req=operation(tx.objectStore('recordings'));req.onsuccess=()=>{result=req.result};tx.oncomplete=()=>{db.close();resolve(result)};tx.onabort=tx.onerror=()=>{db.close();reject(tx.error||Error('Recording storage failed'))}})}
// Store bytes instead of Blob objects: WebKit may reject Blob persistence even
// when ordinary IndexedDB reads/writes succeed. Recreate a Blob only for playback.
export async function saveVoiceRecording(record){const {audio,...metadata}=record;const audioBytes=await audio.arrayBuffer();return run('readwrite',s=>s.put({...metadata,audioBytes}))}
export async function listVoiceRecordings(){return (await run('readonly',s=>s.getAll())).map(({audioBytes,...record})=>({...record,audio:record.audio||new Blob([audioBytes],{type:record.mimeType})}))}
export const deleteVoiceRecording=id=>run('readwrite',s=>s.delete(id));

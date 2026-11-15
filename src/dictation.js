// Own one microphone session and its note. Browser recognition quality still depends
// on the device/service; never interpret a start request as confirmed audio capture.
export function startDictation({Recognition, note, button, status, onFinish=()=>{}, setTimer=setTimeout, clearTimer=clearTimeout}) {
 const show=(text,kind='listening')=>{status.textContent=text;status.className=`dictation-status ${kind}`};
 if(!Recognition){show('Dictation is unavailable in this browser. You can use your keyboard microphone or type.','error');return null}
 const original=note.value;
 let current, closed=false, stopping=false, writing=false, retries=0, prefix=note.value, sessionText='', provisional=false, earlierProvisional=false, failure='', watchdog, stopTimer;
 const deadline=setTimer(()=>stop(),90000);
 const paint=()=>{button.classList.add('listening');button.setAttribute('aria-label','Stop dictating note');button.setAttribute('aria-pressed','true');button.disabled=false};
 const finish=(message,kind)=>{
  if(closed)return;closed=true;
  clearTimer(watchdog);clearTimer(stopTimer);clearTimer(deadline);
  note.removeEventListener('input',edited);
  button.classList.remove('listening');button.setAttribute('aria-label','Start dictating note');button.setAttribute('aria-pressed','false');button.disabled=false;
  show(message,kind);onFinish();
 };
 const completed=()=>finish(failure || (note.value!==original ? `Dictation stopped. Check the words before saving.${provisional||earlierProvisional?' Some words are unconfirmed.':''}` : 'No words captured. Tap the microphone to try again.'),failure?'error':note.value!==original?'success':'error');
 const abort=()=>{try{current?.abort()}catch{}};
 const cancel=()=>{if(closed)return;completed();abort()};
 function edited(){if(writing||closed)return;finish('Dictation stopped for editing. Your note is retained.','');abort()}
 function stop(){if(closed||stopping)return;stopping=true;clearTimer(watchdog);show('Finishing dictation…');stopTimer=setTimer(()=>{completed();abort()},3000);try{current.stop()}catch{completed();abort()}}
 function launch(){
  if(closed)return;
  let r;
  try{r=new Recognition();current=r;r.lang='en-GB';r.interimResults=true;r.continuous=true}catch{failure='Dictation could not start. Your note is retained.';completed();return}
  const valid=()=>!closed&&current===r;
  sessionText='';provisional=false;
  show(retries?'Reconnecting microphone…':'Starting microphone… allow access if asked.');paint();
  watchdog=setTimer(()=>{if(!valid()||stopping)return;failure='Microphone did not become ready. Check microphone permission and connection, then try again. Your note is retained.';completed();abort()},12000);
  r.onaudiostart=()=>{if(!valid()||stopping)return;clearTimer(watchdog);show('● Listening — speak now. Tap microphone to stop.');watchdog=setTimer(()=>{if(!valid()||stopping)return;failure='Microphone is active but no words were returned. Stop and retry, or use your keyboard microphone. Your note is retained.';completed();abort()},15000)};
  r.onspeechstart=()=>{if(valid()&&!stopping)show('Speech detected…')};
  r.onresult=event=>{
   if(!valid())return;clearTimer(watchdog);
   // Rebuild the whole session: interim entries may change or disappear, and
   // resultIndex is a change offset, not an append-only transcript cursor.
   sessionText=Array.from(event.results,result=>result[0].transcript.trim()).filter(Boolean).join(' ');
   provisional=Array.from(event.results).some(result=>!result.isFinal);
   writing=true;note.value=[prefix.trim(),sessionText].filter(Boolean).join(' ');note.dispatchEvent(new Event('input',{bubbles:true}));writing=false;
   show(stopping?'Finishing dictation…':provisional?`Hearing: ${sessionText}`:'Words captured — continue speaking or tap to stop.');
  };
  r.onerror=event=>{
   if(!valid())return;
   const messages={'not-allowed':'Microphone permission was denied. Allow microphone access in browser settings.','service-not-allowed':'Speech recognition is blocked by this browser.','audio-capture':'No microphone is available. Check the device microphone.','network':'Speech recognition lost its connection. Check your internet connection.','language-not-supported':'British English recognition is unavailable in this browser.','aborted':'Dictation was interrupted.'};
   if(event.error==='no-speech'&&!stopping){show('No speech detected yet — waiting for the microphone to restart.');return}
   failure=(messages[event.error]||'Speech recognition stopped unexpectedly.')+' Your note is retained.';completed();abort();
  };
  r.onend=()=>{
   if(!valid())return;clearTimer(watchdog);current=null;
   if(!stopping&&retries<2&&note.isConnected!==false){retries++;earlierProvisional ||= provisional;prefix=note.value;show('Reconnecting microphone…');watchdog=setTimer(launch,350);return}
   completed();
  };
  try{r.start()}catch{failure='Dictation could not start. Check microphone access, then try again. Your note is retained.';completed();abort()}
 }
 note.addEventListener('input',edited);launch();
 return {stop,cancel,get active(){return !closed}};
}

(() => {
  const root=document.getElementById('multi-camera-grid');if(!root)return;
  const socket=io();let iceServers=[{urls:'stun:stun.l.google.com:19302'}];
  const names=['worker1','worker2','worker3'];
  const lastAutoRequest=new Map();
  const peers=new Map(), pending=new Map(), workerSockets=new Map(), records=new Map(), zooms=new Map(), status=new Map();
  const setStatus=(id,msg)=>{status.set(id,msg);const el=root.querySelector('#multi-status-'+id);if(el)el.textContent=msg;};
  for(const id of names){
    const card=document.createElement('article');card.className='multi-feed';card.innerHTML=`<h3>${id.replace('worker','Worker ')}</h3><div class="feed-status" id="multi-status-${id}" role="status">Offline</div><video id="multi-video-${id}" playsinline autoplay></video><div class="multi-feed-controls"><button data-act="start">▶ Camera</button><button data-act="stop">■ Stop</button><button data-act="switch">↻ Switch</button><button data-act="audio">🔊 Audio</button><button data-act="record">⏺ Record</button><button data-act="plus">＋ Zoom</button><button data-act="minus">－ Zoom</button><button data-act="reset">Reset</button><button data-act="fullscreen">⛶ Fullscreen</button></div>`;
    root.append(card);
    card.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>control(id,b.dataset.act,b)));
  }
  const close=(id)=>{const pc=peers.get(id);if(pc){try{pc.close();}catch(_){}peers.delete(id);}pending.delete(id);workerSockets.delete(id);const video=root.querySelector('#multi-video-'+id);video.srcObject=null;};
  function control(id,act,btn){
    const video=root.querySelector('#multi-video-'+id);
    if(act==='start'){if(!socket.connected){setStatus(id,'Admin disconnected');return;}setStatus(id,'Requesting authorized camera…');socket.emit('admin-live-request',{workerId:id,mode:'camera'});return;}
    if(act==='stop'){socket.emit('admin-live-stop',{workerId:id});close(id);setStatus(id,'Stopped');return;}
    if(act==='switch'||act==='audio'){
      if(!peers.has(id))return;
      if(act==='audio'){btn.dataset.muted=btn.dataset.muted==='yes'?'no':'yes';const enabled=btn.dataset.muted!=='yes';btn.textContent=enabled?'🔊 Audio':'🔇 Muted';socket.emit('admin-camera-control',{workerId:id,action:'audio',enabled});}
      else socket.emit('admin-camera-control',{workerId:id,action:'switch'});
      return;
    }
    if(act==='plus'||act==='minus'||act==='reset'){const z=act==='reset'?1:Math.max(1,Math.min(3,(zooms.get(id)||1)+(act==='plus'?.25:-.25)));zooms.set(id,z);video.style.transform=`scale(${z})`;return;}
    if(act==='fullscreen'){if(document.fullscreenElement)document.exitFullscreen();else video.requestFullscreen?.();return;}
    if(act==='record'){
      if(records.has(id)){records.get(id).stop();return;}
      if(!video.srcObject || typeof MediaRecorder==='undefined'){setStatus(id,'No stream or recording unavailable');return;}
      const chunks=[];let rec;try{rec=new MediaRecorder(video.srcObject);}catch(e){setStatus(id,e.message);return;}
      rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      rec.onstop=()=>{records.delete(id);btn.textContent='⏺ Record';if(!chunks.length)return;const blob=new Blob(chunks,{type:rec.mimeType});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${id}-${new Date().toISOString().replace(/[:.]/g,'-')}.webm`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};
      records.set(id,rec);rec.start(1000);btn.textContent='■ Finish recording';
    }
  }
  fetch('/api/rtc-config').then(r=>r.json()).then(v=>{if(v.iceServers)iceServers=v.iceServers;}).catch(()=>{});
  socket.on('workers-state', workers=>{for(const id of names){const w=workers.find(x=>x.id===id);if(!w?.online&&!peers.has(id))setStatus(id,'Offline');else if(w?.online&&!peers.has(id)){setStatus(id,w.liveMode==='NONE'?'Online · ready':'Online · '+w.liveMode);if(w.liveMode==='NONE'&&Date.now()-(lastAutoRequest.get(id)||0)>20000){lastAutoRequest.set(id,Date.now());control(id,'start');}}}});
  socket.on('live-error',({workerId,message})=>{if(!names.includes(workerId))return;close(workerId);setStatus(workerId,message||'Camera failed');});
  socket.on('live-status',({workerId,mode,reason})=>{if(!names.includes(workerId))return;if(mode==='NONE'){close(workerId);setStatus(workerId,reason||'Stopped');}else setStatus(workerId,mode);});
  socket.on('rtc-offer',async({workerId,workerSocketId,offer})=>{
    if(!names.includes(workerId))return;close(workerId);
    const pc=new RTCPeerConnection({iceServers});peers.set(workerId,pc);workerSockets.set(workerId,workerSocketId);
    const stream=new MediaStream();pc.ontrack=e=>{const video=root.querySelector('#multi-video-'+workerId);if(e.streams?.[0])video.srcObject=e.streams[0];else{stream.addTrack(e.track);video.srcObject=stream;}video.play().catch(()=>{});setStatus(workerId,'Broadcasting');};
    pc.onicecandidate=e=>{if(e.candidate)socket.emit('rtc-ice',{targetSocketId:workerSocketId,workerId,candidate:e.candidate});};
    pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')setStatus(workerId,'WebRTC failed: check TURN/ICE');};
    try{await pc.setRemoteDescription(offer);for(const candidate of pending.get(workerId)||[])await pc.addIceCandidate(candidate).catch(()=>{});pending.delete(workerId);const answer=await pc.createAnswer();await pc.setLocalDescription(answer);socket.emit('rtc-answer',{targetSocketId:workerSocketId,workerId,answer:pc.localDescription});}
    catch(e){setStatus(workerId,e.message);close(workerId);socket.emit('admin-live-stop',{workerId});}
  });
  socket.on('rtc-ice',async({workerId,fromSocketId,candidate})=>{if(!names.includes(workerId)||!candidate)return;const pc=peers.get(workerId);if(!pc?.remoteDescription){const list=pending.get(workerId)||[];list.push(candidate);pending.set(workerId,list);return;}if(workerSockets.get(workerId)===fromSocketId)await pc.addIceCandidate(candidate).catch(()=>{});});
  socket.on('disconnect',()=>{for(const id of names){close(id);setStatus(id,'Admin disconnected');}});
})();

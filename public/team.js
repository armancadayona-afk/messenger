(() => {
  const node = id => window.adminPageNode?.(id) || document.getElementById(id);
  const root = node('team-root');
  if (!root) return;
  const admin = root.dataset.role === 'admin';
  let data = { tasks: [], earnings: [], messages: [], withdrawals: [] };
  let selected = 'worker1';
  const escape = v => String(v ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const cash = n => Number(n || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  const date = ms => new Date(ms).toLocaleString();
  const names = {worker1:'Worker 1',worker2:'Worker 2',worker3:'Worker 3'};
  const workers = () => `<select id="team-worker">${Object.entries(names).map(([id,n])=>`<option value="${id}" ${id===selected?'selected':''}>${n}</option>`).join('')}</select>`;
  const endpoint = async (url, obj) => {
    const response = await fetch(url,{method:obj?'POST':'GET',headers:{'Content-Type':'application/json'},...(obj?{body:JSON.stringify(obj)}:{})});
    if(!response.ok){const issue=await response.json().catch(()=>({}));throw Error(issue.error||'Request failed');}
    return response.json();
  };
  const report = error => { const el=root.querySelector('#team-error');if(el)el.textContent=error?.message||''; };
  const assigned = t => t.workerId===selected || t.workerId===null;
  const mine = t => !admin || t.workerId===selected;
  function render() {
    const tasks = data.tasks.filter(assigned);
    const ledger = data.earnings.filter(e=>e.workerId===selected || !admin);
    const total = ledger.reduce((v,e)=>v+e.amount,0);
    const available=ledger.filter(e=>e.paymentStatus==='available').reduce((v,e)=>v+e.amount,0) - (data.withdrawals||[]).filter(w=>(!admin||w.workerId===selected)&&['requested','approved'].includes(w.status)).reduce((v,w)=>v+w.amount,0);
    const pending=ledger.filter(e=>e.paymentStatus==='pending').reduce((v,e)=>v+e.amount,0);
    const messages = data.messages.filter(m=>m.workerId===selected || !admin);
    root.innerHTML = `<div class="team-panel"><div class="row between"><div><div class="eyebrow">🎀 Team workspace</div><h2>Tasks · Earnings · Chat</h2></div>${admin?workers():''}</div><div id="team-error" role="status" style="color:#b72a65;min-height:20px"></div><div class="team-grid">
      <section class="card"><h2>📋 Task management</h2><p class="team-subtitle">One active task per worker by default. Admin can allow concurrent tasks.</p>
       ${admin?`<form class="team-form" id="task-create"><input name="title" maxlength="160" placeholder="Task name" required><textarea name="description" maxlength="1500" placeholder="Instructions (optional)" rows="2"></textarea><select name="workerId"><option value="open">Open to everyone</option>${Object.entries(names).map(([id,n])=>`<option value="${id}">${n}</option>`).join('')}</select><input name="price" type="number" min="0" step="0.01" placeholder="Task price" value="0" required><label><input type="checkbox" name="allowConcurrent" style="width:auto"> Allow concurrent tasks</label><button class="btn">Add task</button></form>`:''}
       <div class="team-list">${tasks.length?tasks.map(t=>`<div class="team-row"><strong>${escape(t.title)}</strong> <span class="team-subtitle">${escape(t.status.replace('_',' '))}</span><p>${escape(t.description)}</p><p class="team-subtitle">${t.workerId?escape(names[t.workerId]||t.workerId):'Open to all'} · ${cash(t.price)} · ${t.timeMs? (t.timeMs/3600000).toFixed(2)+' hr':'No reported hours yet'}</p><div class="team-actions">${!admin&&(t.status==='open'||t.status==='assigned')?`<button class="btn" data-task="${t.id}" data-action="accept">Accept</button>`:''}${!admin&&t.status==='in_progress'?`<button class="btn" data-task="${t.id}" data-action="submit">Submit task</button>`:''}${admin&&t.status==='submitted'?`<button class="btn" data-task="${t.id}" data-action="approve">Approve & credit</button>`:''}${admin&&t.status!=='approved'&&t.status!=='cancelled'?`<button class="btn secondary" data-task="${t.id}" data-action="cancel">Cancel</button>`:''}</div></div>`).join(''):'<p class="muted">No tasks yet.</p>'}</div>
      </section>
      <section class="card"><h2>💰 Earnings</h2><p style="font-size:28px;font-weight:800;margin:12px 0">${cash(total)}</p><p class="team-subtitle">Pending (48-hour hold): ${cash(pending)} · Available for withdrawal: ${cash(Math.max(0,available))}</p>${!admin?`<form id="withdraw-create" class="team-form"><input type="number" name="amount" min="0.01" step="0.01" max="${Math.max(0,available)}" placeholder="Amount to withdraw" required><button class="btn">Request withdrawal</button></form>`:''}${admin?`<form id="earning-create" class="team-form"><input name="title" placeholder="Bonus / completed task description" required><input name="amount" type="number" min="0" step="0.01" required placeholder="Amount"><button class="btn">Add earning / bonus</button></form>`:''}<div class="team-list">${ledger.map(e=>`<div class="team-row"><strong>${escape(e.title)}</strong><p>${cash(e.amount)} · ${escape(e.type)}</p><span class="team-subtitle">${date(e.createdAt)} · ${escape(e.paymentStatus||'available')}</span></div>`).join('')||'<p class="muted">No earnings posted.</p>'}<h3>Withdrawal requests</h3><div class="team-list">${(data.withdrawals||[]).filter(w=>!admin||w.workerId===selected).map(w=>`<div class="team-row">${cash(w.amount)} · ${escape(w.status)} ${admin&&['requested','approved'].includes(w.status)?`<button class="btn" data-withdraw="${w.id}" data-act="approve">Approve</button><button class="btn" data-withdraw="${w.id}" data-act="complete">Complete</button><button class="btn secondary" data-withdraw="${w.id}" data-act="reject">Reject</button>`:''}</div>`).join('')||'<p class="muted">No withdrawal requests</p>'}</div></section>
      <section class="card"><h2>💌 Team chat</h2><p class="team-subtitle">Private conversation between admin and selected worker.</p><div class="chat-list" id="team-chat">${messages.map(m=>`<div class="chat-bubble ${m.role===(admin?'admin':'worker')?'mine':''}"><strong>${escape(m.author)}</strong><div>${escape(m.message)}</div><span class="team-subtitle">${date(m.createdAt)}</span></div>`).join('')||'<p class="muted">No messages yet.</p>'}</div><form id="chat-send" class="team-form"><textarea name="message" required maxlength="2000" rows="2" placeholder="Type a message..."></textarea><button class="btn">Send message</button></form></section>
    </div></div>`;
    if (admin) {
      // Move real task, earnings, and chat panels into their separate page mounts.
      // No duplicate Socket.IO instance or fake data is created.
      const sections=Array.from(root.querySelectorAll('.team-grid > section'));
      const tasksPage=node('admin-tasks-page');
      const earningsPage=node('admin-earnings-page');
      const chatPage=node('admin-chat-page');
      if(tasksPage && earningsPage && chatPage && sections.length===3){
        const header=root.querySelector('.team-panel > .row');
        sections[0].insertAdjacentHTML('afterbegin','<button type="button" class="btn secondary" id="go-earnings">View Earnings & Payments →</button>');
        tasksPage.appendChild(sections[0]);
        earningsPage.replaceChildren(sections[1]);
        chatPage.replaceChildren(sections[2]);
        tasksPage.querySelector('#go-earnings')?.addEventListener('click',()=>window.openAdminPage?.('earnings'));
      }
    }
    if (!admin) {
      const sections = Array.from(root.querySelectorAll('.team-grid > section'));
      ['worker-tasks','worker-earnings','worker-chat'].forEach((id,i) => {
        const dest=node(id); if (dest && sections[i]) dest.replaceChildren(sections[i]);
      });
      // Preserve the old event delegation by locating controls in their new page containers.
    }
    // Query all mounted or temporarily detached page containers. Admin routing moves
    // pages out of the DOM, but their live controls still require event handlers.
    const adminMounts=[root,node('admin-tasks-page'),node('admin-earnings-page'),node('admin-chat-page')].filter(Boolean);
    const scope=admin?{
      querySelector:selector=>adminMounts.map(m=>m.querySelector(selector)).find(Boolean)||null,
      querySelectorAll:selector=>adminMounts.flatMap(m=>Array.from(m.querySelectorAll(selector)))
    }:document;
    const withdrawal=scope.querySelector('#withdraw-create');if(withdrawal)withdrawal.addEventListener('submit',async e=>{e.preventDefault();await execute('/api/withdrawals',{amount:Number(new FormData(withdrawal).get('amount'))});});
    scope.querySelectorAll('[data-withdraw]').forEach(b=>b.addEventListener('click',async()=>execute(`/api/withdrawals/${b.dataset.withdraw}/action`,{action:b.dataset.act})));
    const selector=root.querySelector('#team-worker'); if(selector)selector.addEventListener('change',e=>{selected=e.target.value;render();});
    const make=scope.querySelector('#task-create');if(make)make.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(make); await execute('/api/tasks',{title:f.get('title'),description:f.get('description'),workerId:f.get('workerId'),price:Number(f.get('price')),allowConcurrent:make.elements.allowConcurrent.checked});});
    const earn=scope.querySelector('#earning-create');if(earn)earn.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(earn);await execute('/api/earnings',{workerId:selected,title:f.get('title'),amount:Number(f.get('amount'))});});
    scope.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('click',async()=>{const action=b.dataset.action;let payload={action};if(action==='approve'){const task=data.tasks.find(t=>t.id===b.dataset.task);const input=prompt('Approved earnings amount',String(task.price));if(input===null)return;payload.amount=Number(input);}await execute(`/api/tasks/${b.dataset.task}/action`,payload);}));
    scope.querySelector('#chat-send')?.addEventListener('submit',async e=>{e.preventDefault();let message=e.target.elements.message.value.trim();if(message)await execute('/api/messages',{workerId:selected,message});});
    const chat=scope.querySelector('#team-chat');if(chat)chat.scrollTop=chat.scrollHeight;
    if(!admin){const el=node('worker-report-list');if(el)el.innerHTML=data.tasks.filter(t=>t.workerId && t.status!=='open').map(t=>`<div class="team-row"><strong>${escape(t.title)}</strong> · ${escape(t.status)} · ${(t.timeMs/3600000).toFixed(2)} hours</div>`).join('')||'No task records yet.';}
  }
  async function refresh(){try{data=await endpoint('/api/team');render();}catch(e){report(e);}}
  async function execute(url,obj){try{await endpoint(url,obj);await refresh();}catch(e){report(e);}}
  refresh();
  // Independent socket for task updates; does not interfere with existing WebRTC socket.
  const socket=io();socket.on('team-update',next=>{data=next;render();});
  window.addEventListener('beforeunload',()=>socket.disconnect());
})();

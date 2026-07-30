// --- GharSync Multi-Group Engine & Task Claiming Permissions ---

let activeUser = { id: 'u1', name: 'Sadi', phone: '+92 300 1234567' };
let currentGroupId = 'g1';
let taskFilterState = 'pending'; // 'pending' | 'completed'

let groups = [
  {
    id: 'g1',
    name: 'Khan Family Household 🏡',
    type: 'family',
    avatar: '🏡',
    lastMsg: 'Ammi: 2 kilo aloo le aao',
    lastTime: '11:32 AM',
    unread: 2,
    shareUrl: 'https://gharsync.app/join?code=GHAR-786-KHAN',
    members: [
      { id: 'u1', name: 'Sadi', role: 'member', phone: '+92 300 1234567' },
      { id: 'u2', name: 'Ammi', role: 'admin', phone: '+92 300 9876543' },
      { id: 'u3', name: 'Abbu', role: 'runner', phone: '+92 301 5554433' }
    ]
  },
  {
    id: 'g2',
    name: 'Office Project Team 💼',
    type: 'office',
    avatar: '💼',
    lastMsg: 'Ali: Submit project report by 5 PM',
    lastTime: '10:15 AM',
    unread: 1,
    shareUrl: 'https://gharsync.app/join?code=OFFICE-99-WORK',
    members: [
      { id: 'u1', name: 'Sadi', role: 'member', phone: '+92 300 1234567' },
      { id: 'u4', name: 'Ali (Manager)', role: 'admin', phone: '+92 302 1112233' }
    ]
  }
];

let chatMessages = {
  g1: [
    { id: 'm1', sender: 'Abbu', text: 'Assalam o Alaikum, main market ja raha hoon. Kisi ko kuch mangwana hai?', time: '10:30 AM', type: 'chat' },
    { id: 'm2', sender: 'Ammi', text: '2 kilo aloo aur 1.5 liter doodh le aao.', time: '10:32 AM', type: 'purchase', extracted: { item: 'Aloo', qty: 2, unit: 'kg', cat: 'Vegetables' } },
    { id: 'm3', sender: 'Abbu', text: 'Aaj paani ki botlein bharwani hain.', time: '10:35 AM', type: 'task', extracted: { title: 'Fill Water Bottles', assignee: 'General Unassigned', due: 'Today' } }
  ],
  g2: []
};

// Purchase Items per group (with createdBy field)
let purchaseItems = {
  g1: [
    { id: 'p1', name: 'Aloo (Potatoes)', qty: 2, unit: 'kg', category: 'Vegetables', status: 'pending', addedBy: 'Ammi', createdBy: 'Ammi' },
    { id: 'p2', name: 'Doodh (Fresh Milk)', qty: 1.5, unit: 'liter', category: 'Dairy', status: 'pending', addedBy: 'Ammi', createdBy: 'Ammi' },
    { id: 'p3', name: 'Dettol Soap Pack', qty: 1, unit: 'box', category: 'Toiletries', status: 'bought', addedBy: 'Sadi', createdBy: 'Sadi' }
  ],
  g2: []
};

// Tasks per group (Assigned vs General Unassigned + createdBy + Status)
let taskItems = {
  g1: [
    { id: 't1', title: 'Fill Water Bottles', assignee: 'General Unassigned', due: 'Today, 5:00 PM', status: 'pending', createdBy: 'Abbu', gSynced: true },
    { id: 't2', title: 'Sadi pay electricity bill by 5 PM today', assignee: 'Sadi', due: 'Today, 5:00 PM', status: 'pending', createdBy: 'Ammi', gSynced: true },
    { id: 't3', title: 'Pick up medical report from clinic', assignee: 'Abbu', due: 'Yesterday', status: 'completed', createdBy: 'Ammi', gSynced: true }
  ],
  g2: []
};

// --- Smart Intent Classifier ---
function classifyMessageIntent(text) {
  const lower = text.toLowerCase().trim();

  // Task Intent Detection
  if (/(by\s+\d+|at\s+\d+|today|tomorrow|baje|tak|submit|pay|pick\s+up|clean|fill|bottle|paani|water|bill)/i.test(lower) &&
      !/(kilo|kg|liter|doodh|aloo|soap|sabun|grocery)/i.test(lower)) {

    let assignee = 'General Unassigned'; // Default to General Task if no person named
    if (lower.includes('sadi')) assignee = 'Sadi';
    if (lower.includes('ammi')) assignee = 'Ammi';
    if (lower.includes('abbu')) assignee = 'Abbu';

    let cleanTask = text.replace(/^(sadi|ammi|abbu|please|plz)\s+/gi, '').replace(/\b(by\s+.*|today|tomorrow)\b/gi, '').trim();
    cleanTask = cleanTask.charAt(0).toUpperCase() + cleanTask.slice(1);

    return { type: 'task', title: cleanTask, assignee: assignee, due: 'Today, 5:00 PM' };
  }

  // Purchase Intent Detection
  if (/(kilo|kg|liter|ltr|doodh|milk|aloo|pyaz|tamatar|soap|dettol|paneer|chawal|atta|pizza|burger|mangwa|le\s+aao|buy|get)/i.test(lower)) {
    const parsed = parsePurchaseDetails(text);
    return { type: 'purchase', item: parsed.name, qty: parsed.qty, unit: parsed.unit, cat: parsed.category };
  }

  return { type: 'chat' };
}

function parsePurchaseDetails(text) {
  let t = text.toLowerCase().trim();
  t = t.replace(/^\b(please|plz|mujhe|hameen|kindly|can you|bring|get|buy)\b\s*/gi, '');
  t = t.replace(/\b(chahiye|lekar\s+aao|le\s+aao|laana\s+hai|mangwa\s+do|bhej\s+do|bhi)\b/gi, '').trim();

  let qty = 1;
  let unit = 'pcs';
  let cleanName = t;
  let category = 'Grocery';

  if (/^\b(do|two|2)\b/i.test(t)) { qty = 2; t = t.replace(/^\b(do|two|2)\b\s*/i, ''); }
  if (/^\b(teen|three|3)\b/i.test(t)) { qty = 3; t = t.replace(/^\b(teen|three|3)\b\s*/i, ''); }

  const match = t.match(/^([\d\.\/]+)\s*([a-zA-Z]*)\s+(.+)$/);
  if (match) {
    qty = parseFloat(match[1]) || 1;
    if (match[2]) unit = match[2];
    cleanName = match[3];
  }

  if (/(aloo|pyaz|tamatar|sabzi)/.test(cleanName)) category = 'Vegetables';
  else if (/(doodh|milk|dahi)/.test(cleanName)) category = 'Dairy';
  else if (/(soap|dettol|shampoo)/.test(cleanName)) category = 'Toiletries';

  cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  return { name: cleanName, qty, unit, category };
}

// --- App Flow ---

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('screenSplash').classList.add('hidden');
    document.getElementById('screenLogin').classList.remove('hidden');
  }, 1000);

  document.getElementById('loginBtn').addEventListener('click', completeLogin);

  document.getElementById('backToGroupsBtn').addEventListener('click', () => {
    document.getElementById('screenGroupWorkspace').classList.add('hidden');
    document.getElementById('screenGroupsList').classList.remove('hidden');
    renderGroupsList();
  });

  // Modal Handlers
  document.getElementById('newGroupBtn').addEventListener('click', () => document.getElementById('createGroupModal').classList.remove('hidden'));
  document.getElementById('fabNewGroup').addEventListener('click', () => document.getElementById('createGroupModal').classList.remove('hidden'));
  document.getElementById('closeCreateGroupBtn').addEventListener('click', () => document.getElementById('createGroupModal').classList.add('hidden'));
  document.getElementById('confirmCreateGroupBtn').addEventListener('click', handleCreateGroup);

  // Workspace Sub-Tabs (4 Screens)
  document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.workspace-tab').forEach(w => w.classList.remove('active'));

      e.currentTarget.classList.add('active');
      const subtarget = e.currentTarget.getAttribute('data-subtab');
      document.getElementById(subtarget).classList.add('active');
    });
  });

  // Header Settings Button
  document.getElementById('openGroupSettingsHeaderBtn').addEventListener('click', () => {
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.workspace-tab').forEach(w => w.classList.remove('active'));

    const settingsTabBtn = document.querySelector('.sub-tab[data-subtab="tabSettings"]');
    if (settingsTabBtn) settingsTabBtn.classList.add('active');
    document.getElementById('tabSettings').classList.add('active');
  });

  // Task Filter Chips
  document.getElementById('taskFilterPending').addEventListener('click', () => {
    taskFilterState = 'pending';
    document.getElementById('taskFilterPending').classList.add('active');
    document.getElementById('taskFilterCompleted').classList.remove('active');
    renderTasksList();
  });
  document.getElementById('taskFilterCompleted').addEventListener('click', () => {
    taskFilterState = 'completed';
    document.getElementById('taskFilterCompleted').classList.add('active');
    document.getElementById('taskFilterPending').classList.remove('active');
    renderTasksList();
  });

  // Chat Send Handler
  document.getElementById('sendChatBtn').addEventListener('click', sendChatMessage);
  document.getElementById('chatMessageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Voice Note Button
  setupVoiceRecorder();

  // Settings Handlers
  document.getElementById('saveGroupNameBtn').addEventListener('click', () => {
    const newName = document.getElementById('editGroupNameInput').value.trim();
    const group = groups.find(g => g.id === currentGroupId);
    if (group && newName) {
      group.name = newName;
      document.getElementById('currentGroupName').innerText = newName;
      alert('Group Name Updated!');
    }
  });

  document.getElementById('copyShareUrlBtn').addEventListener('click', () => {
    const url = document.getElementById('groupShareUrl').innerText;
    navigator.clipboard.writeText(url);
    alert(`Invite Link Copied:\n${url}`);
  });
});

function completeLogin() {
  const selectedPersona = document.getElementById('userPersonaSelect').value;
  activeUser.name = selectedPersona;
  document.getElementById('activeUserPill').innerText = `👤 ${selectedPersona}`;

  document.getElementById('screenLogin').classList.add('hidden');
  document.getElementById('screenGroupsList').classList.remove('hidden');

  renderGroupsList();
}

function renderGroupsList() {
  const container = document.getElementById('groupsListContainer');
  container.innerHTML = '';

  groups.forEach(g => {
    const tile = document.createElement('div');
    tile.className = 'group-chat-tile';
    tile.onclick = () => openGroupWorkspace(g.id);

    tile.innerHTML = `
      <div class="group-avatar">${g.avatar}</div>
      <div class="group-tile-content">
        <div class="group-title-row">
          <span class="group-name">${g.name}</span>
          <span class="last-time">${g.lastTime}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="group-last-msg">${g.lastMsg}</span>
          ${g.unread > 0 ? `<span class="unread-badge">${g.unread}</span>` : ''}
        </div>
      </div>
    `;
    container.appendChild(tile);
  });
}

function openGroupWorkspace(groupId) {
  currentGroupId = groupId;
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  document.getElementById('currentGroupName').innerText = group.name;
  document.getElementById('editGroupNameInput').value = group.name;
  document.getElementById('groupShareUrl').innerText = group.shareUrl || 'https://gharsync.app/join?code=GHAR-786-KHAN';
  document.getElementById('currentGroupSub').innerText = `${group.members.length} members • ${purchaseItems[groupId]?.length || 0} purchases`;

  document.getElementById('screenGroupsList').classList.add('hidden');
  document.getElementById('screenGroupWorkspace').classList.remove('hidden');

  renderWorkspace();
}

function renderWorkspace() {
  renderChatFeed();
  renderPurchasingList();
  renderTasksList();
  renderMembersList();
}

function renderChatFeed() {
  const container = document.getElementById('chatMessagesContainer');
  container.innerHTML = '';

  const msgs = chatMessages[currentGroupId] || [];
  msgs.forEach(m => {
    const isOut = m.sender === activeUser.name || m.sender === 'You';
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${isOut ? 'out' : 'in'}`;

    let aiCardHtml = '';
    if (m.type === 'purchase' && m.extracted) {
      aiCardHtml = `
        <div class="ai-tag-card purchase">
          <span>🛒 AI Auto-Added Purchase: <strong>${m.extracted.qty} ${m.extracted.unit} ${m.extracted.item}</strong></span>
        </div>
      `;
    } else if (m.type === 'task' && m.extracted) {
      aiCardHtml = `
        <div class="ai-tag-card task">
          <span>📋 AI Auto-Created Task: <strong>${m.extracted.title}</strong> (${m.extracted.assignee})</span>
        </div>
      `;
    }

    bubble.innerHTML = `
      <div class="msg-sender">${m.sender}</div>
      <div>${m.text}</div>
      ${aiCardHtml}
      <span class="msg-time">${m.time}</span>
    `;
    container.appendChild(bubble);
  });

  container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
  const input = document.getElementById('chatMessageInput');
  const text = input.value.trim();
  if (!text) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const intent = classifyMessageIntent(text);

  const newMsg = {
    id: Date.now().toString(),
    sender: activeUser.name,
    text: text,
    time: timeStr,
    type: intent.type
  };

  if (intent.type === 'purchase') {
    newMsg.extracted = intent;
    if (!purchaseItems[currentGroupId]) purchaseItems[currentGroupId] = [];
    purchaseItems[currentGroupId].unshift({
      id: Date.now().toString(),
      name: intent.item,
      qty: intent.qty,
      unit: intent.unit,
      category: intent.cat || 'Grocery',
      status: 'pending',
      addedBy: activeUser.name,
      createdBy: activeUser.name
    });
  } else if (intent.type === 'task') {
    newMsg.extracted = intent;
    if (!taskItems[currentGroupId]) taskItems[currentGroupId] = [];
    taskItems[currentGroupId].unshift({
      id: Date.now().toString(),
      title: intent.title,
      assignee: intent.assignee,
      due: intent.due,
      status: 'pending',
      createdBy: activeUser.name,
      gSynced: true
    });
  }

  if (!chatMessages[currentGroupId]) chatMessages[currentGroupId] = [];
  chatMessages[currentGroupId].push(newMsg);

  const group = groups.find(g => g.id === currentGroupId);
  if (group) {
    group.lastMsg = `${activeUser.name}: ${text}`;
    group.lastTime = timeStr;
  }

  input.value = '';
  renderWorkspace();
}

function renderPurchasingList() {
  const container = document.getElementById('purchasingItemsList');
  container.innerHTML = '';

  const items = purchaseItems[currentGroupId] || [];
  document.getElementById('tabPurchasingBadge').innerText = items.filter(i => i.status === 'pending').length;

  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:20px;">No purchases in this group yet.</p>';
    return;
  }

  items.forEach(i => {
    const tile = document.createElement('div');
    tile.className = `item-tile ${i.status === 'bought' ? 'bought' : ''}`;
    const canDelete = i.createdBy === activeUser.name;

    tile.innerHTML = `
      <button class="check-btn" onclick="togglePurchaseStatus('${i.id}')">${i.status === 'bought' ? '✅' : '🛒'}</button>
      <div class="item-info">
        <div class="item-title-row">
          <span class="item-title">${i.name}</span>
          <span class="qty-tag">${i.qty} ${i.unit}</span>
        </div>
        <div class="item-meta">
          <span>Added by ${i.addedBy}</span>
          <span>${i.category}</span>
        </div>
      </div>
      ${canDelete 
        ? `<button class="delete-btn-creator" onclick="deletePurchaseItem('${i.id}')">Delete (Creator)</button>` 
        : `<span class="delete-btn-disabled" title="Only creator (${i.createdBy}) can delete">Action Only</span>`}
    `;
    container.appendChild(tile);
  });
}

function togglePurchaseStatus(id) {
  const item = (purchaseItems[currentGroupId] || []).find(i => i.id === id);
  if (item) {
    item.status = item.status === 'pending' ? 'bought' : 'pending';
    renderWorkspace();
  }
}

function deletePurchaseItem(id) {
  const list = purchaseItems[currentGroupId] || [];
  const item = list.find(i => i.id === id);
  if (item && item.createdBy === activeUser.name) {
    purchaseItems[currentGroupId] = list.filter(i => i.id !== id);
    renderWorkspace();
  } else {
    alert(`Permission Denied: Only the creator (${item.createdBy}) can delete this purchase item!`);
  }
}

function renderTasksList() {
  const container = document.getElementById('tasksListContainer');
  container.innerHTML = '';

  const allTasks = taskItems[currentGroupId] || [];
  const pendingTasks = allTasks.filter(t => t.status === 'pending');
  const completedTasks = allTasks.filter(t => t.status === 'completed');

  document.getElementById('pendingTasksCount').innerText = pendingTasks.length;
  document.getElementById('completedTasksCount').innerText = completedTasks.length;
  document.getElementById('tabTasksBadge').innerText = pendingTasks.length;

  const displayTasks = taskFilterState === 'pending' ? pendingTasks : completedTasks;

  if (displayTasks.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">No ${taskFilterState} tasks in this group.</p>`;
    return;
  }

  displayTasks.forEach(t => {
    const card = document.createElement('div');
    card.className = `task-card ${t.status === 'completed' ? 'completed' : ''}`;

    const isUnassigned = t.assignee === 'General Unassigned' || !t.assignee;
    const canDelete = t.createdBy === activeUser.name;

    card.innerHTML = `
      <div class="task-title-row">
        <span class="task-title" style="${t.status === 'completed' ? 'text-decoration:line-through;' : ''}">${t.title}</span>
        <span style="font-size:11px; color:#2563eb; font-weight:700;">📅 Google Synced</span>
      </div>
      <div class="task-meta">
        ${isUnassigned
          ? `<button class="btn-claim-task" onclick="claimTask('${t.id}')">➕ Claim / Assign to Me (${activeUser.name})</button>`
          : `<span class="task-assignee-badge">👤 Assignee: ${t.assignee}</span>`}

        ${t.status === 'pending'
          ? `<button class="btn-complete-task" onclick="completeTask('${t.id}')">✓ Done</button>`
          : `<span style="color:#059669; font-weight:800;">✓ Completed</span>`}
      </div>
      <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:8px;">
        <span>Created by: ${t.createdBy}</span>
        ${canDelete 
          ? `<button class="delete-btn-creator" style="font-size:10px;" onclick="deleteTaskItem('${t.id}')">Delete (Creator)</button>`
          : `<span class="delete-btn-disabled" style="font-size:10px;" title="Only creator can delete">Only Creator Delete</span>`}
      </div>
    `;
    container.appendChild(card);
  });
}

function claimTask(id) {
  const task = (taskItems[currentGroupId] || []).find(t => t.id === id);
  if (task) {
    task.assignee = activeUser.name;
    alert(`🎉 Task "${task.title}" claimed by ${activeUser.name}! Auto-synced to your Google Calendar & Google Tasks.`);
    renderWorkspace();
  }
}

function completeTask(id) {
  const task = (taskItems[currentGroupId] || []).find(t => t.id === id);
  if (task) {
    task.status = 'completed';
    renderWorkspace();
  }
}

function deleteTaskItem(id) {
  const list = taskItems[currentGroupId] || [];
  const task = list.find(t => t.id === id);
  if (task && task.createdBy === activeUser.name) {
    taskItems[currentGroupId] = list.filter(t => t.id !== id);
    renderWorkspace();
  } else {
    alert(`Permission Denied: Only creator (${task.createdBy}) can delete this task!`);
  }
}

function renderMembersList() {
  const container = document.getElementById('settingsMembersList');
  container.innerHTML = '';

  const group = groups.find(g => g.id === currentGroupId);
  if (!group) return;

  group.members.forEach(m => {
    const tile = document.createElement('div');
    tile.className = 'member-tile';
    tile.innerHTML = `
      <div>
        <div class="member-name">${m.name}</div>
        <div style="font-size:11px; color:var(--text-muted);">${m.phone}</div>
      </div>
      <span class="member-role">${m.role.toUpperCase()}</span>
    `;
    container.appendChild(tile);
  });
}

function setupVoiceRecorder() {
  const voiceBtn = document.getElementById('voiceNoteBtn');
  const input = document.getElementById('chatMessageInput');

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
      voiceBtn.innerText = '🔴';
      rec.start();
    });

    rec.onresult = (e) => {
      input.value = e.results[0][0].transcript;
      voiceBtn.innerText = '🎙️';
      sendChatMessage();
    };

    rec.onend = () => voiceBtn.innerText = '🎙️';
  } else {
    voiceBtn.addEventListener('click', () => {
      const samples = [
        'Aaj paani ki botlein bharwani hain',
        'Sadi pay electricity bill by 5 PM today',
        '2 kilo aloo aur 1.5 liter doodh le aao'
      ];
      input.value = samples[Math.floor(Math.random() * samples.length)];
      sendChatMessage();
    });
  }
}

function handleCreateGroup() {
  const name = document.getElementById('newGroupNameInput').value.trim();
  const cat = document.getElementById('newGroupCategorySelect').value;
  if (!name) return;

  const newId = 'g' + (groups.length + 1);
  const avatar = cat === 'family' ? '🏡' : (cat === 'office' ? '💼' : '⚡');

  groups.unshift({
    id: newId,
    name: `${name} ${avatar}`,
    type: cat,
    avatar: avatar,
    lastMsg: 'Group created',
    lastTime: 'Just now',
    unread: 0,
    shareUrl: `https://gharsync.app/join?code=GHAR-${Math.floor(100+Math.random()*900)}`,
    members: [{ id: activeUser.id, name: activeUser.name, role: 'admin', phone: activeUser.phone }]
  });

  chatMessages[newId] = [];
  purchaseItems[newId] = [];
  taskItems[newId] = [];

  document.getElementById('newGroupNameInput').value = '';
  document.getElementById('createGroupModal').classList.add('hidden');
  renderGroupsList();
}

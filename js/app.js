// ============================================
// CONFIG & API
// ============================================
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
const TG = window.Telegram?.WebApp;

const api = {
  async fetch(endpoint, opts = {}) {
    const initData = TG?.initData || '';
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `tma ${initData}`,
        ...opts.headers
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  get: (url) => api.fetch(url),
  post: (url, data) => api.fetch(url, { method: 'POST', body: JSON.stringify(data) })
};

// ============================================
// STATE (простой объект, без классов)
// ============================================
const state = {
  user: { xp: 0, level: 'Новичок', completed: [] },
  lessons: [],
  
  async load() {
    const [user, lessons] = await Promise.all([
      api.get('/me').catch(() => ({ xp: 0, completed: [] })),
      api.get('/lessons')
    ]);
    this.user = { ...this.user, ...user };
    this.lessons = lessons;
    this.render();
  },
  
  async complete(id) {
    if (this.user.completed.includes(id)) return;
    await api.post('/progress', { lesson_id: id });
    this.user.completed.push(id);
    this.user.xp += 50; // или получи с сервера
    haptic('success');
    this.render();
    toast(`+50 XP`);
  },
  
  render() {
    // Обновляем все [data-bind] элементы
    document.querySelectorAll('[data-bind]').forEach(el => {
      const key = el.dataset.bind;
      if (key === 'xp') el.textContent = this.user.xp;
      if (key === 'level') el.textContent = this.user.level;
      if (key === 'streak') el.textContent = this.user.streak || 0;
      if (key === 'progress') {
        const pct = (this.user.completed.length / this.lessons.length) * 100;
        el.style.width = `${pct}%`;
      }
    });
    
    // Обновляем счетчики
    const completed = this.user.completed.length;
    document.querySelectorAll('[data-count]').forEach(el => {
      if (el.dataset.count === 'completed') el.textContent = completed;
      if (el.dataset.count === 'total') el.textContent = this.lessons.length;
    });
  }
};

// ============================================
// UI HELPERS
// ============================================
const $ = (sel) => document.querySelector(sel);
const haptic = (type) => TG?.HapticFeedback?.impactOccurred(type);
const toast = (msg) => {
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
};

// ============================================
// LESSON VIEWER
// ============================================
const viewer = {
  open(id) {
    const lesson = state.lessons.find(l => l.id === id);
    if (!lesson) return;
    
    $('#lesson-title').textContent = lesson.title;
    $('#lesson-content').innerHTML = lesson.content;
    $('#lesson-cat').textContent = lesson.category;
    
    const isDone = state.user.completed.includes(id);
    $('#btn-complete').textContent = isDone ? '✓ Пройдено' : 'Я всё понял';
    $('#btn-complete').disabled = isDone;
    $('#btn-complete').dataset.id = id;
    
    $('#page-lesson').classList.add('active');
    TG?.BackButton?.show();
    haptic('medium');
  },
  
  close() {
    $('#page-lesson').classList.remove('active');
    TG?.BackButton?.hide();
  }
};

// ============================================
// RENDERERS
// ============================================
function renderLibrary(filter = 'all') {
  const grid = $('#library-grid');
  if (!grid) return;
  
  const lessons = filter === 'all' 
    ? state.lessons 
    : state.lessons.filter(l => l.category === filter);
  
  grid.innerHTML = lessons.map(l => `
    <article class="problem-card ${state.user.completed.includes(l.id) ? 'completed' : ''}" 
             data-action="open" data-id="${l.id}">
      <span class="icon">${l.icon || '📚'}</span>
      <span class="lesson-category-tag">${l.category}</span>
      <h3>${l.title}</h3>
      <p>${l.duration} • ${l.xp} XP</p>
      <span class="link-arrow">Открыть →</span>
    </article>
  `).join('');
}

// ============================================
// EVENT DELEGATION (вместо onclick)
// ============================================
document.body.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  
  const { action, id } = btn.dataset;
  
  switch(action) {
    case 'open':
      viewer.open(+id);
      break;
      
    case 'complete':
      await state.complete(+id);
      btn.textContent = '✓ Пройдено';
      btn.disabled = true;
      renderLibrary(); // обновить галочки
      break;
      
    case 'close':
      viewer.close();
      break;
      
    case 'filter':
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderLibrary(btn.dataset.filter);
      break;
      
    case 'next':
      // логика следующего урока
      break;
  }
});

// ============================================
// TELEGRAM INIT
// ============================================
if (TG) {
  TG.ready();
  TG.expand();
  TG.BackButton.onClick(() => viewer.close());
}

// ============================================
// STARTUP
// ============================================
state.load().then(() => {
  renderLibrary();
  console.log('App ready', state);
});
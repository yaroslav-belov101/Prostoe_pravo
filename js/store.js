import { API } from './api.js';

// Глобальное состояние (reactive без фреймворков)
export const Store = {
    data: { xp: 0, level: 1, lessons: [], completed: [] },
    async load() {
    const [progress, lessons] = await Promise.all([
        API.get('/me').catch(() => ({ xp: 0, completed: [] })),
        API.get('/lessons').catch(() => [])
    ]);
    
    this.data = { ...this.data, ...progress, lessons };
    this.render();
    },

    async completeLesson(id) {
        if (this.data.completed.includes(id)) return;
        await API.post('/progress', { lesson_id: id });
        this.data.completed.push(id);
        this.data.xp += 50; // или получить с сервера
        this.render();
    },

  // UI обновляется автоматически при изменении данных
    render() {
        document.querySelectorAll('[data-bind]').forEach(el => {
        const key = el.dataset.bind;
        if (key === 'xp') el.textContent = this.data.xp;
        if (key === 'level') el.textContent = this.data.level;
        });
    }
    };
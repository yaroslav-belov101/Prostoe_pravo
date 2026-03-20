// ============================================
// УПРАВЛЕНИЕ СОСТОЯНИЕМ ПРИЛОЖЕНИЯ
// ============================================

const State = {
    // Данные
    data: {
        completedLessons: [],
        favorites: [],
        xp: 0,
        level: 1,
        streak: 0,
        lastVisit: null,
        achievements: [],
        currentLesson: null,
        quizResults: []
    },
    
    // Загрузка
    async load() {
        const saved = await Storage.get('state', null);
        if (saved) {
            this.data = { ...this.data, ...saved };
        }
        this.checkStreak();
        return this.data;
    },
    
    // Сохранение
    async save() {
        await Storage.set('state', this.data);
    },
    
    // Сброс
    async reset() {
        this.data = {
            completedLessons: [],
            favorites: [],
            xp: 0,
            level: 1,
            streak: 0,
            lastVisit: null,
            achievements: [],
            currentLesson: null,
            quizResults: []
        };
        await this.save();
    },
    
    // Проверка серии
    checkStreak() {
        if (!this.data.lastVisit) return;
        
        const last = new Date(this.data.lastVisit);
        const now = new Date();
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Серия продолжается — ничего не делаем
        } else if (diffDays > 1) {
            // Серия прервалась
            if (this.data.streak > 2) {
                this.showStreakLost();
            }
            this.data.streak = 0;
        }
    },
    
    // Показать уведомление о потере серии
    showStreakLost() {
        if (Utils.isTelegram()) {
            Utils.tg('showPopup', {
                title: 'Серия прервалась! 😢',
                message: `Ты был на ${this.data.streak}-дневной серии. Вернись сегодня, чтобы начать новую!`,
                buttons: [{ type: 'ok' }]
            });
        } else {
            Utils.toast(`Серия прервалась! Было ${this.data.streak} дней`);
        }
    },
    
    // Обновить время посещения
    async updateVisit() {
        this.data.lastVisit = new Date().toISOString();
        await this.save();
    },
    
    // Геттеры
    get completedLessons() { return this.data.completedLessons; },
    get favorites() { return this.data.favorites; },
    get xp() { return this.data.xp; },
    get level() { return this.data.level; },
    get streak() { return this.data.streak; },
    get achievements() { return this.data.achievements; },
    
    // Проверка пройден ли урок
    isCompleted(lessonId) {
        return this.data.completedLessons.includes(lessonId);
    },
    
    // Проверка в избранном ли
    isFavorite(lessonId) {
        return this.data.favorites.includes(lessonId);
    },
    
    // Добавить XP
    async addXP(amount) {
        this.data.xp += amount;
        const newLevel = this.calculateLevel();
        
        if (newLevel > this.data.level) {
            this.data.level = newLevel;
            this.showLevelUp(newLevel);
        }
        
        await this.save();
        UI.updateUserStats();
        return this.data.xp;
    },
    
    // Рассчитать уровень
    calculateLevel() {
        for (let i = CONFIG.LEVELS.length - 1; i >= 0; i--) {
            if (this.data.xp >= CONFIG.LEVELS[i].xpRequired) {
                return CONFIG.LEVELS[i].level;
            }
        }
        return 1;
    },
    
    // Получить название уровня
    getLevelName() {
        const level = CONFIG.LEVELS.find(l => l.level === this.data.level);
        return level ? level.name : 'Легенда';
    },
    
    // Показать повышение уровня
    showLevelUp(newLevel) {
        const levelName = this.getLevelName();
        
        if (Utils.isTelegram()) {
            Utils.tg('showPopup', {
                title: `Новый уровень! 🎉`,
                message: `Ты достиг уровня "${levelName}"!`,
                buttons: [{ type: 'ok' }]
            });
            Utils.haptic('success');
        } else {
            Utils.toast(`🎉 Новый уровень: ${levelName}!`);
        }
    },
    
    // Отметить урок пройденным
    async completeLesson(lessonId) {
        if (!this.data.completedLessons.includes(lessonId)) {
            this.data.completedLessons.push(lessonId);
            this.data.streak++;
            await this.updateVisit();
            await this.save();
            
            // Находим урок для XP
            const lesson = CONFIG.LESSONS.find(l => l.id === lessonId);
            if (lesson) {
                await this.addXP(lesson.xp);
            }
            
            return true;
        }
        return false;
    },
    
    // Переключить избранное
    async toggleFavorite(lessonId) {
        const index = this.data.favorites.indexOf(lessonId);
        
        if (index > -1) {
            this.data.favorites.splice(index, 1);
            await this.save();
            return false; // Удалено
        } else {
            this.data.favorites.push(lessonId);
            await this.save();
            return true; // Добавлено
        }
    },
    
    // Прогресс в процентах
    getProgress() {
        const total = CONFIG.LESSONS.length;
        const completed = this.data.completedLessons.length;
        return {
            completed,
            total,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
};
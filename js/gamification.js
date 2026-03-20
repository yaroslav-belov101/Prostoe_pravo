// ============================================
// ГЕЙМИФИКАЦИЯ: XP, УРОВНИ, АЧИВКИ
// ============================================

const Gamification = {
    // Проверить и выдать ачивки
    async checkAchievements() {
        const newAchievements = [];
        
        // Первая ачивка — первый урок
        if (State.completedLessons.length === 1 && !this.hasAchievement('first_lesson')) {
            newAchievements.push(await this.unlock('first_lesson'));
        }
        
        // 5 уроков
        if (State.completedLessons.length >= 5 && !this.hasAchievement('five_lessons')) {
            newAchievements.push(await this.unlock('five_lessons'));
        }
        
        // Все уроки
        if (State.completedLessons.length === CONFIG.LESSONS.length && !this.hasAchievement('all_lessons')) {
            newAchievements.push(await this.unlock('all_lessons'));
        }
        
        // Серия 7 дней
        if (State.streak >= 7 && !this.hasAchievement('week_streak')) {
            newAchievements.push(await this.unlock('week_streak'));
        }
        
        // Серия 30 дней
        if (State.streak >= 30 && !this.hasAchievement('month_streak')) {
            newAchievements.push(await this.unlock('month_streak'));
        }
        
        return newAchievements;
    },
    
    // Проверить есть ли ачивка
    hasAchievement(id) {
        return State.achievements.includes(id);
    },
    
    // Выдать ачивку
    async unlock(id) {
        if (this.hasAchievement(id)) return null;
        
        const achievement = this.getAchievementData(id);
        State.data.achievements.push(id);
        await State.save();
        
        // Бонус XP за ачивку
        await State.addXP(achievement.xp || 25);
        
        // Показать уведомление
        this.showUnlockNotification(achievement);
        
        return achievement;
    },
    
    // Данные ачивки
    getAchievementData(id) {
        const achievements = {
            first_lesson: { id: 'first_lesson', name: 'Первый шаг', desc: 'Пройти первый урок', icon: '🎯', xp: 25 },
            five_lessons: { id: 'five_lessons', name: 'Ученик', desc: 'Пройти 5 уроков', icon: '📚', xp: 50 },
            all_lessons: { id: 'all_lessons', name: 'Эксперт', desc: 'Пройти все уроки', icon: '🏆', xp: 200 },
            week_streak: { id: 'week_streak', name: 'Неделя без перерыва', desc: '7 дней подряд', icon: '🔥', xp: 50 },
            month_streak: { id: 'month_streak', name: 'Марафонец', desc: '30 дней подряд', icon: '💪', xp: 150 },
            perfect_quiz: { id: 'perfect_quiz', name: 'Знаток', desc: 'Идеально пройти тест', icon: '⭐', xp: 30 },
            collector_master: { id: 'collector_master', name: 'Коллектороборец', desc: 'Пройти урок про коллекторов', icon: '🛡️', xp: 20 },
            rent_expert: { id: 'rent_expert', name: 'Арендатор', desc: 'Пройти все уроки про аренду', icon: '🏠', xp: 40 }
        };
        
        return achievements[id] || { id, name: 'Ачивка', desc: 'Получена', icon: '🎁', xp: 10 };
    },
    
    // Показать уведомление о новой ачивке
    showUnlockNotification(achievement) {
        const message = `🏆 Новая ачивка: ${achievement.name}! +${achievement.xp} XP`;
        
        if (Utils.isTelegram()) {
            Utils.tg('showPopup', {
                title: 'Ачивка разблокирована! 🎉',
                message: `${achievement.name}\n${achievement.desc}\n+${achievement.xp} XP`,
                buttons: [{ type: 'ok' }]
            });
            Utils.haptic('success');
        } else {
            Utils.toast(message, 5000);
        }
    },
    
    // Получить список всех ачивок с статусом
    getAllAchievements() {
        const allIds = ['first_lesson', 'five_lessons', 'all_lessons', 'week_streak', 'month_streak', 'perfect_quiz', 'collector_master', 'rent_expert'];
        
        return allIds.map(id => {
            const data = this.getAchievementData(id);
            return {
                ...data,
                unlocked: this.hasAchievement(id)
            };
        });
    },
    
    // Рендер ачивок (для личного кабинета)
    renderAchievements(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const achievements = this.getAllAchievements();
        
        container.innerHTML = achievements.map(a => `
            <div class="achievement ${a.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-info">
                    <h4>${a.name}</h4>
                    <p>${a.desc}</p>
                    ${a.unlocked ? '<span class="achievement-xp">+' + a.xp + ' XP</span>' : '<span class="achievement-locked">🔒</span>'}
                </div>
            </div>
        `).join('');
    }
};
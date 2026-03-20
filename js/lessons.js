// ============================================
// МОДУЛЬ УРОКОВ
// ============================================
const Lessons = {
    // Текущий открытый урок
    currentLessonId: null,
    currentLessonIndex: 0,

    // Открыть урок по ID
    open(lessonId) {
        const lesson = CONFIG.LESSONS.find(l => l.id === lessonId);
        if (!lesson) {
            Utils.toast('Урок не найден');
            return;
        }

        this.currentLessonId = lessonId;
        this.currentLessonIndex = CONFIG.LESSONS.findIndex(l => l.id === lessonId);

        // Показать страницу урока
        UI.showLessonPage(lesson);

        // Скрыть главную кнопку TWA если открыта
        if (Utils.isTelegram()) {
            window.Telegram.WebApp.MainButton.hide();
            window.Telegram.WebApp.BackButton.show();
        }

        // Сохранить текущий урок в состоянии
        State.data.currentLesson = lessonId;
        State.save();

        Utils.haptic('medium');
    },

    // Закрыть урок
    close() {
        UI.hideLessonPage();
        this.currentLessonId = null;

        // Скрыть кнопку назад в TWA
        if (Utils.isTelegram()) {
            window.Telegram.WebApp.BackButton.hide();
        }

        // Очистить текущий урок в состоянии
        State.data.currentLesson = null;
        State.save();

        Utils.haptic('light');
    },

    // Отметить урок как пройденный
    async markComplete() {
        if (!this.currentLessonId) return;

        const lesson = CONFIG.LESSONS.find(l => l.id === this.currentLessonId);
        if (!lesson) return;

        // Проверить, не пройден ли уже
        if (State.isCompleted(this.currentLessonId)) {
            Utils.toast('Урок уже пройден');
            return;
        }

        // Отметить в состоянии
        await State.completeLesson(this.currentLessonId);

        // Обновить UI кнопки
        UI.updateCompleteButton();

        // Показать уведомление
        Utils.toast(`+${lesson.xp} XP получено!`);
        Utils.haptic('success');

        // Проверить ачивки
        await Gamification.checkAchievements();

        // Обновить статистику
        UI.updateUserStats();
    },

    // Следующий урок
    next() {
        if (this.currentLessonIndex < CONFIG.LESSONS.length - 1) {
            const nextLesson = CONFIG.LESSONS[this.currentLessonIndex + 1];
            this.open(nextLesson.id);
            Utils.haptic('light');
        } else {
            Utils.toast('Это последний урок в библиотеке');
            Utils.haptic('warning');
        }
    },

    // Предыдущий урок
    prev() {
        if (this.currentLessonIndex > 0) {
            const prevLesson = CONFIG.LESSONS[this.currentLessonIndex - 1];
            this.open(prevLesson.id);
            Utils.haptic('light');
        } else {
            Utils.toast('Это первый урок в библиотеке');
            Utils.haptic('warning');
        }
    },

    // Переключить избранное
    async toggleFavorite() {
        if (!this.currentLessonId) return;

        const isFav = await State.toggleFavorite(this.currentLessonId);
        UI.updateFavoriteButton(this.currentLessonId);

        if (isFav) {
            Utils.toast('Добавлено в избранное ⭐');
            Utils.haptic('success');
        } else {
            Utils.toast('Удалено из избранного');
            Utils.haptic('light');
        }
    },

    // Поделиться уроком
    share() {
        if (!this.currentLessonId) return;

        const lesson = CONFIG.LESSONS.find(l => l.id === this.currentLessonId);
        if (!lesson) return;

        const shareText = `📚 Простое право: ${lesson.title}\n\nИзучи за ${lesson.duration} и получи +${lesson.xp} XP!`;
        const shareUrl = `https://t.me/${CONFIG.BOT_USERNAME}?start=lesson_${lesson.id}`;

        if (Utils.isTelegram()) {
            // Используем нативный шеринг Telegram
            window.Telegram.WebApp.openTelegramLink(
                `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
            );
        } else {
            // Копировать в буфер
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
                .then(() => {
                    Utils.toast('Ссылка скопирована!');
                })
                .catch(() => {
                    Utils.toast('Не удалось скопировать ссылку');
                });
        }

        Utils.haptic('light');
    },

    // Продолжить обучение (последний открытый урок)
    continueLearning() {
        // Если есть текущий урок в состоянии
        if (State.data.currentLesson) {
            this.open(State.data.currentLesson);
            return;
        }

        // Если нет текущего, найти первый непройденный
        const incompleteLesson = CONFIG.LESSONS.find(
            l => !State.completedLessons.includes(l.id)
        );

        if (incompleteLesson) {
            this.open(incompleteLesson.id);
        } else {
            // Все уроки пройдены
            Utils.toast('🎉 Все уроки пройдены! Отличная работа!');
            Utils.haptic('success');
            
            // Предложить пройти тест
            setTimeout(() => {
                App.navigate('test');
            }, 1500);
        }
    },

    // Получить список уроков по категории
    getByCategory(category) {
        if (category === 'all') {
            return CONFIG.LESSONS;
        }
        return CONFIG.LESSONS.filter(l => l.category === category);
    },

    // Получить прогресс по категории
    getCategoryProgress(category) {
        const lessons = this.getByCategory(category);
        const completed = lessons.filter(l => 
            State.completedLessons.includes(l.id)
        ).length;
        
        return {
            total: lessons.length,
            completed,
            percent: lessons.length > 0 
                ? Math.round((completed / lessons.length) * 100) 
                : 0
        };
    },

    // Получить следующий непройденный урок
    getNextIncomplete() {
        return CONFIG.LESSONS.find(
            l => !State.completedLessons.includes(l.id)
        );
    },

    // Проверить, все ли уроки пройдены
    allCompleted() {
        return State.completedLessons.length >= CONFIG.LESSONS.length;
    }
};
// ============================================
// РАБОТА С ИНТЕРФЕЙСОМ (DOM)
// ============================================
const UI = {
    init() {
        this.renderLibrary();
        this.renderProblems();
        this.updateUserStats();
        this.setupEventListeners();
    },

    updateUserStats() {
        const progress = State.getProgress();
        
        const miniLevel = document.getElementById('mini-level');
        const miniXp = document.getElementById('mini-xp');
        if (miniLevel) miniLevel.textContent = State.getLevelName();
        if (miniXp) miniXp.textContent = `${State.xp} XP`;

        const mobileLevel = document.getElementById('mobile-level');
        const mobileXp = document.getElementById('mobile-xp');
        const mobileStreak = document.getElementById('mobile-streak');
        if (mobileLevel) mobileLevel.textContent = State.getLevelName();
        if (mobileXp) mobileXp.textContent = State.xp;
        if (mobileStreak) mobileStreak.textContent = `🔥 ${State.streak}`;

        const mainLevel = document.getElementById('main-level');
        const mainXp = document.getElementById('main-xp');
        const mainStreak = document.getElementById('main-streak');
        const mainProgressFill = document.getElementById('main-progress-fill');
        const mainProgressText = document.getElementById('main-progress-text');
        const completedCounter = document.getElementById('completed-counter');
        
        if (mainLevel) mainLevel.textContent = State.getLevelName();
        if (mainXp) mainXp.textContent = State.xp;
        if (mainStreak) mainStreak.textContent = State.streak;
        if (mainProgressFill) mainProgressFill.style.width = `${progress.percent}%`;
        if (mainProgressText) mainProgressText.textContent = `${progress.completed}/${progress.total} уроков`;
        if (completedCounter) completedCounter.textContent = progress.completed;
    },

    renderLibrary(filter = 'all') {
        const grid = document.getElementById('library-grid');
        if (!grid) return;
        
        let lessons = CONFIG.LESSONS;
        if (filter !== 'all') {
            lessons = lessons.filter(l => l.category === filter);
        }
        
        grid.innerHTML = lessons.map(lesson => this.createLessonCard(lesson)).join('');
    },

    renderProblems() {
        const grid = document.getElementById('problems-grid');
        if (!grid) return;
        
        const problems = CONFIG.LESSONS.slice(0, 4);
        grid.innerHTML = problems.map((lesson, index) => {
            const isUrgent = index === 0;
            return this.createProblemCard(lesson, isUrgent);
        }).join('');
    },

    createLessonCard(lesson) {
        const isCompleted = State.isCompleted(lesson.id);
        const isFavorite = State.isFavorite(lesson.id);
        
        return `
            <div class="problem-card ${isCompleted ? 'completed' : ''}" onclick="Lessons.open(${lesson.id})">
                <div class="card-header">
                    <span class="icon">${lesson.categoryName.split(' ')[0]}</span>
                    ${isFavorite ? '<span class="fav-icon">★</span>' : ''}
                </div>
                <span class="lesson-category-tag">${lesson.categoryName}</span>
                <h3>${lesson.title}</h3>
                <p>${lesson.type} • ${lesson.duration} • ${lesson.xp} XP</p>
                <div class="card-footer">
                    <span class="link-arrow">Открыть урок →</span>
                    ${isCompleted ? '<span class="completed-check">✓</span>' : ''}
                </div>
            </div>
        `;
    },

    createProblemCard(lesson, isUrgent = false) {
        return `
            <div class="problem-card ${isUrgent ? 'urgent' : ''}" onclick="Lessons.open(${lesson.id})">
                <span class="icon">${lesson.categoryName.split('0')[0]}</span>
                <h3>${lesson.title}</h3>
                <p>${lesson.type} • ${lesson.duration}</p>
                <span class="link-arrow">Открыть урок →</span>
            </div>
        `;
    },

    // ✅ ИСПРАВЛЕНО: Добавлен параметр event
    filterLibrary(category, event) {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        
        // ✅ Используем currentTarget вместо target (надёжнее)
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
        
        this.renderLibrary(category);
        Utils.haptic('light');
    },

    showLessonPage(lesson) {
        const overlay = document.getElementById('page-lesson');
        
        document.getElementById('lesson-title').textContent = lesson.title;
        document.getElementById('lesson-cat').textContent = lesson.categoryName;
        document.getElementById('lesson-type').textContent = lesson.type;
        document.getElementById('lesson-time').textContent = `⏱ ${lesson.duration}`;
        document.getElementById('lesson-xp').textContent = `+${lesson.xp} XP`;
        document.getElementById('lesson-content').innerHTML = lesson.content;

        const isCompleted = State.isCompleted(lesson.id);
        const completedBadge = document.getElementById('lesson-completed');
        const completeBtn = document.getElementById('mark-complete-btn');
        
        if (completedBadge) {
            completedBadge.style.display = isCompleted ? 'inline' : 'none';
        }
        
        if (completeBtn) {
            if (isCompleted) {
                completeBtn.innerHTML = '<span class="complete-icon">✓</span><span class="complete-text">Уже пройдено</span>';
                completeBtn.disabled = true;
                completeBtn.style.opacity = '0.6';
            } else {
                completeBtn.innerHTML = '<span class="complete-icon">✓</span><span class="complete-text">Я всё понял</span>';
                completeBtn.disabled = false;
                completeBtn.style.opacity = '1';
            }
        }

        this.updateFavoriteButton(lesson.id);

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('reading-progress').style.width = '0%';
        
        Utils.haptic('medium');
    },

    hideLessonPage() {
        const overlay = document.getElementById('page-lesson');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    updateFavoriteButton(lessonId) {
        const btn = document.getElementById('fav-btn');
        if (!btn) return;
        
        const isFav = State.isFavorite(lessonId);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    },

    updateCompleteButton() {
        const btn = document.getElementById('mark-complete-btn');
        if (btn) {
            btn.innerHTML = '<span class="complete-icon">✓</span><span class="complete-text">Сохранено!</span>';
            btn.classList.add('success');
            btn.disabled = true;
        }
        
        const badge = document.getElementById('lesson-completed');
        if (badge) badge.style.display = 'inline';
    },

    setupEventListeners() {
        const contentBox = document.querySelector('.lesson-content-box');
        if (contentBox) {
            contentBox.addEventListener('scroll', Utils.throttle(() => {
                // ✅ ИСПРАВЛЕНО: Защита от деления на ноль
                const maxScroll = contentBox.scrollHeight - contentBox.clientHeight;
                const scrollPercent = maxScroll > 0 
                    ? (contentBox.scrollTop / maxScroll) * 100 
                    : 100;
                    
                document.getElementById('reading-progress').style.width = `${Math.min(scrollPercent, 100)}%`;
            }, 50));
        }
    },

    showQuizResult(score, total) {
        const resultDiv = document.getElementById('quiz-result');
        const title = document.getElementById('result-title');
        const text = document.getElementById('result-text');
        const actions = document.getElementById('result-actions');
        
        resultDiv.classList.add('show');

        let resultTitle, resultMessage;
        if (score === total) {
            resultTitle = '🔥 Ты юридически подкован!';
            resultMessage = 'Ты разбираешься в базовых ситуациях лучше 80% населения.';
            State.addXP(CONFIG.XP.TEST_PERFECT);
            Gamification.unlock('perfect_quiz');
        } else if (score >= total * 0.7) {
            resultTitle = '⚡️ Неплохо, но есть пробелы';
            resultMessage = 'Рекомендуем пройти базовый курс.';
            State.addXP(CONFIG.XP.TEST_GOOD);
        } else {
            resultTitle = '📚 Пора учиться';
            resultMessage = 'Начни с бесплатного раздела SOS.';
        }

        title.textContent = resultTitle;
        text.textContent = `${resultMessage} Правильных ответов: ${score}/${total}`;

        actions.innerHTML = `
            <a href="#library" class="btn btn-primary" onclick="App.navigate('library'); return false;" style="margin-top: 1rem;">
                Начать учиться
            </a>
            ${score === total ? '<button class="btn btn-secondary" onclick="Quiz.shareResult()" style="margin-top: 0.5rem;">Поделиться результатом</button>' : ''}
        `;
    }
};
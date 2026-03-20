// ============================================
// ЛОГИКА ТЕСТА
// ============================================

const Quiz = {
    currentQuestion: 1,
    score: 0,
    answers: [],
    
    // Ответ на вопрос
    answer(questionNum, isCorrect) {
        this.answers[questionNum - 1] = isCorrect;
        if (isCorrect) this.score++;
        
        // Анимация
        const current = document.querySelector(`[data-question="${questionNum}"]`);
        current.style.opacity = '0';
        current.style.transform = 'translateX(-20px)';
        
        Utils.haptic('light');
        
        setTimeout(() => {
            current.classList.remove('active');
            
            if (questionNum < CONFIG.QUIZ_QUESTIONS.length) {
                const next = document.querySelector(`[data-question="${questionNum + 1}"]`);
                next.classList.add('active');
                this.currentQuestion = questionNum + 1;
            } else {
                this.finish();
            }
        }, 300);
    },
    
    // Завершение теста
    finish() {
        UI.showQuizResult(this.score, CONFIG.QUIZ_QUESTIONS.length);
        Utils.haptic('success');
    },
    
    // Сброс теста
    reset() {
        this.currentQuestion = 1;
        this.score = 0;
        this.answers = [];
        
        document.querySelectorAll('.quiz-question').forEach((q, i) => {
            q.classList.toggle('active', i === 0);
            q.style.opacity = '';
            q.style.transform = '';
        });
        
        document.getElementById('quiz-result').classList.remove('show');
    },
    
    // Поделиться результатом
    shareResult() {
        const text = `Я набрал ${this.score}/${CONFIG.QUIZ_QUESTIONS.length} в тесте на юридическую грамотность! А ты сможешь лучше?`;
        const url = `https://t.me/${CONFIG.BOT_USERNAME}`;
        
        if (Utils.isTelegram()) {
            Utils.tg('openTelegramLink', `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        } else {
            navigator.clipboard.writeText(`${text}\n${url}`);
            Utils.toast('Результат скопирован!');
        }
    }
};
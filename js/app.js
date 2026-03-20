// ============================================
// ГЛАВНЫЙ МОДУЛЬ
// ============================================
const App = {
    async init() {
        console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} запущен`);
        
        if (Utils.isTelegram()) {
            this.initTWA();
        }
        
        await State.load();
        UI.init();
        this.checkReferral();
        
        if (State.completedLessons.length === 0) {
            this.showWelcome();
        }
        
        State.updateVisit();
        this.setupGestures();
    },

    initTWA() {
        const TWA = window.Telegram.WebApp;
        TWA.ready();
        TWA.expand();
        TWA.setHeaderColor('#0a0a0a');
        TWA.setBackgroundColor('#0a0a0a');

        TWA.onEvent('viewportChanged', () => {
            document.documentElement.style.setProperty('--tg-viewport-height', TWA.viewportHeight + 'px');
        });

        TWA.BackButton.onClick(() => {
            if (document.getElementById('page-lesson').classList.contains('active')) {
                Lessons.close();
            } else {
                TWA.BackButton.hide();
            }
        });
    },

    navigate(page) {
        const targets = {
            home: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            library: () => document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' }),
            problems: () => document.getElementById('problems')?.scrollIntoView({ behavior: 'smooth' }),
            test: () => document.getElementById('test')?.scrollIntoView({ behavior: 'smooth' }),
            pricing: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
        };
        
        if (targets[page]) {
            targets[page]();
            Utils.haptic('light');
        }
    },

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('active');
        Utils.haptic('medium');
    },

    openTelegram() {
        const url = `https://t.me/${CONFIG.BOT_USERNAME}`;
        if (Utils.isTelegram()) {
            Utils.tg('openTelegramLink', url);
        } else {
            window.open(url, '_blank');
        }
    },

    // ✅ ИСПРАВЛЕНО: Проверка на инициализацию TWA
    checkReferral() {
        if (!Utils.isTelegram()) return;
        
        // ✅ Дополнительная проверка на initDataUnsafe
        if (!window.Telegram.WebApp?.initDataUnsafe) return;
        
        const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
        if (!startParam) return;
        
        if (startParam.startsWith('ref_')) {
            const refCode = startParam.replace('ref_', '');
            console.log('Реферальный код:', refCode);
            State.addXP(CONFIG.XP.REFERRAL);
            Utils.toast('Бонус за приглашение друга! +50 XP');
        }
        
        if (startParam.startsWith('lesson_')) {
            const lessonId = parseInt(startParam.replace('lesson_', ''));
            setTimeout(() => Lessons.open(lessonId), 1000);
        }
    },

    showWelcome() {
        setTimeout(() => {
            if (Utils.isTelegram()) {
                Utils.tg('showPopup', {
                    title: 'Добро пожаловать! 👋',
                    message: 'Пройди быстрый тест, чтобы узнать свой уровень юридической грамотности.',
                    buttons: [
                        { id: 'test', type: 'default', text: 'Пройти тест' },
                        { type: 'cancel' }
                    ]
                }, (buttonId) => {
                    if (buttonId === 'test') {
                        this.navigate('test');
                    }
                });
            }
        }, 1500);
    },

    setupGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const deltaX = touchStartX - touchEndX;
            const deltaY = touchStartY - touchEndY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (document.getElementById('page-lesson').classList.contains('active')) {
                    if (deltaX > 0) {
                        Lessons.next();
                    } else {
                        Lessons.prev();
                    }
                }
            }
        }, { passive: true });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
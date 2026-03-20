// script.js — Полная переработка для Telegram Web App

// ============================================
// ИНИЦИАЛИЗАЦИЯ TWA
// ============================================
const tg = window.Telegram?.WebApp;
const isTg = !!tg;

// Инициализация при загрузке
if (isTg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#0a0a0a');
    tg.setBackgroundColor('#0a0a0a');
    
    // Обработка изменения viewport (клавиатура, свайпы)
    tg.onEvent('viewportChanged', () => {
        document.documentElement.style.setProperty('--tg-viewport-height', tg.viewportHeight + 'px');
    });
}

// ============================================
// ДАННЫЕ
// ============================================

const lessonsData = [
    {
        id: 1,
        title: "Как не потерять депозит за квартиру",
        category: "rent",
        categoryName: "🏠 Аренда",
        type: "📄 Статья",
        duration: "5 мин",
        xp: 50,
        difficulty: "easy",
        content: `
            <h2>Акт приема-передачи — твой щит</h2>
            <p>При заселении сфотографируй ВСЕ: стены, окна, бытовую технику, даже розетки. Это единственные доказательства при выселении.</p>
            
            <h2>3 красных флага в договоре</h2>
            <ul>
                <li>Арендодатель отказывается подписывать акт</li>
                <li>В договоре нет срока возврата депозита</li>
                <li>Указана «комиссия за уборку» при выезде</li>
            </ul>
            
            <h2>Что делать, если уже подписал</h2>
            <p>Отправь арендодателю фото с описанием дефектов в мессенджере и сохрани переписку. Это тоже доказательства.</p>
            
            <div class="tip-box">
                <strong>💡 Лайфхак:</strong> Сделай видеообход квартиры с привязкой к дате (скажи вслух "сегодня 15 марта 2024").
            </div>
        `,
        isCompleted: false
    },
    {
        id: 2,
        title: "Трудовой договор: где тебя разводят",
        category: "work",
        categoryName: "💼 Работа",
        type: "📋 Чек-лист",
        duration: "8 мин",
        xp: 80,
        difficulty: "medium",
        content: `
            <h2>Проверь эти пункты перед подписанием</h2>
            <ul>
                <li>Срок испытательного срока (не более 3 месяцев)</li>
                <li>Дата выдачи зарплаты (должна быть конкретной цифрой, не «до 10-го»)</li>
                <li>Условия увольнения (нельзя уволить без объяснения причин)</li>
            </ul>
            
            <h2>Фриланс vs Трудовой договор</h2>
            <p>Если тебя заставляют оформляться как самозанятого, но ты ходишь в офис 5/2 — это незаконно. Ты должен быть в штате.</p>
            
            <div class="warning-box">
                <strong>⚠️ Внимание:</strong> Договор с ИП — это не трудовой договор. У тебя не будет отпусков и больничных.
            </div>
        `,
        isCompleted: false
    },
    {
        id: 3,
        title: "Коллекторы: как отбиться от звонков",
        category: "money",
        categoryName: "💸 Деньги",
        type: "⚡️ Быстрый гайд",
        duration: "3 мин",
        xp: 30,
        difficulty: "easy",
        content: `
            <h2>Твои действия за 5 минут</h2>
            <ol>
                <li>Запиши разговор (законно, если предупредил)</li>
                <li>Скажи: «Я не подтверждаю долг, пришлите документы»</li>
                <li>Отправь заявление о прекращении обработки персональных данных</li>
            </ol>
            
            <p><strong>Важно:</strong> Если долг не твой — они обязаны удалить твои данные в течение 30 дней.</p>
        `,
        isCompleted: false
    },
    {
        id: 4,
        title: "Подписки: как вернуть деньги",
        category: "money",
        categoryName: "💸 Деньги",
        type: "📄 Статья",
        duration: "4 мин",
        xp: 40,
        difficulty: "easy",
        content: `
            <h2>Автопродление — не всегда законно</h2>
            <p>Если сервис не прислал уведомление о списании за 3 дня — ты можешь оспорить платеж.</p>
            
            <h2>Алгоритм возврата</h2>
            <ul>
                <li>Напиши в поддержку первым делом</li>
                <li>Если отказ — обращайся в банк (чарджбэк)</li>
                <li>Последняя инстанция — Роспотребнадзор</li>
            </ul>
        `,
        isCompleted: false
    },
    {
        id: 5,
        title: "Договор аренды: скрытые ловушки",
        category: "rent",
        categoryName: "🏠 Аренда",
        type: "📋 Чек-лист",
        duration: "10 мин",
        xp: 100,
        difficulty: "hard",
        content: `
            <h2>Пункты, которые нельзя подписывать</h2>
            <ul>
                <li>«Арендатор ремонтирует за свой счет»</li>
                <li>«Запрет на проживание второго человека»</li>
                <li>«Арендодатель может выселить без предупреждения»</li>
            </ul>
            
            <h2>Что должно быть в договоре обязательно</h2>
            <ol>
                <li>Паспортные данные обеих сторон</li>
                <li>Точный адрес и площадь</li>
                <li>Сумма аренды и депозита прописью</li>
                <li>Срок действия договора</li>
                <li>Порядок расторжения</li>
            </ol>
        `,
        isCompleted: false
    },
    {
        id: 6,
        title: "Увольнение: как уйти с деньгами",
        category: "work",
        categoryName: "💼 Работа",
        type: "⚡️ Быстрый гайд",
        duration: "6 мин",
        xp: 60,
        difficulty: "medium",
        content: `
            <h2>Твои выплаты при увольнении</h2>
            <ul>
                <li>Зарплата за отработанные дни</li>
                <li>Компенсация за неиспользованный отпуск</li>
                <li>Северance (если сокращение) — 1 оклад</li>
            </ul>
            
            <h2>«По соглашению сторон» — ловушка</h2>
            <p>HR давит подписать? Требуй компенсацию в 3 оклада минимум. Или отказывайся — тогда уволят по статье с выплатами.</p>
        `,
        isCompleted: false
    }
];

// ============================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ============================================

const AppState = {
    currentLessonId: null,
    completedLessons: [],
    favorites: [],
    xp: 0,
    level: 1,
    streak: 0,
    lastVisit: null,
    
    // Загрузка из хранилища
    async load() {
        if (isTg) {
            try {
                const data = await tg.CloudStorage.getItem('appState');
                if (data) {
                    const parsed = JSON.parse(data);
                    Object.assign(this, parsed);
                }
            } catch (e) {
                console.log('CloudStorage недоступен, используем localStorage');
                this.loadFromLocal();
            }
        } else {
            this.loadFromLocal();
        }
        
        this.checkStreak();
    },
    
    loadFromLocal() {
        const saved = localStorage.getItem('prostoepravo_state');
        if (saved) {
            Object.assign(this, JSON.parse(saved));
        }
    },
    
    // Сохранение
    async save() {
        const data = {
            completedLessons: this.completedLessons,
            favorites: this.favorites,
            xp: this.xp,
            level: this.level,
            streak: this.streak,
            lastVisit: new Date().toISOString()
        };
        
        if (isTg) {
            try {
                await tg.CloudStorage.setItem('appState', JSON.stringify(data));
            } catch (e) {
                localStorage.setItem('prostoepravo_state', JSON.stringify(data));
            }
        } else {
            localStorage.setItem('prostoepravo_state', JSON.stringify(data));
        }
    },
    
    // Проверка серии (streak)
    checkStreak() {
        if (!this.lastVisit) return;
        
        const last = new Date(this.lastVisit);
        const now = new Date();
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Серия продолжается
        } else if (diffDays > 1) {
            // Серия прервалась
            if (this.streak > 2 && isTg) {
                tg.showPopup({
                    title: 'Серия прервалась! 😢',
                    message: `Ты был на ${this.streak}-дневной серии. Вернись сегодня, чтобы начать новую!`,
                    buttons: [{type: 'ok'}]
                });
            }
            this.streak = 0;
        }
    },
    
    // Добавление XP
    addXP(amount) {
        this.xp += amount;
        const newLevel = this.calculateLevel();
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showLevelUp();
        }
        
        this.save();
        this.updateUI();
    },
    
    calculateLevel() {
        if (this.xp < 100) return 1;
        if (this.xp < 300) return 2;
        if (this.xp < 600) return 3;
        if (this.xp < 1000) return 4;
        return 5;
    },
    
    getLevelName() {
        const names = ['Новичок', 'Подкован', 'Юрист в кармане', 'Мастер договоров', 'Юридический ниндзя'];
        return names[this.level - 1] || 'Легенда';
    },
    
    showLevelUp() {
        if (isTg) {
            tg.showPopup({
                title: `Новый уровень! 🎉`,
                message: `Ты достиг уровня "${this.getLevelName()}"!`,
                buttons: [{type: 'ok'}]
            });
            tg.HapticFeedback?.notificationOccurred('success');
        }
    },
    
    updateUI() {
        // Обновление счётчиков на странице
        const xpEl = document.getElementById('user-xp');
        const levelEl = document.getElementById('user-level');
        
        if (xpEl) xpEl.textContent = this.xp;
        if (levelEl) levelEl.textContent = this.getLevelName();
    }
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await AppState.load();
    updateProgress();
    renderLibrary();
    initBackButton();
    checkReferral();
    
    // Показываем приветствие для новых пользователей
    if (AppState.completedLessons.length === 0 && isTg) {
        setTimeout(() => {
            tg.showPopup({
                title: 'Добро пожаловать! 👋',
                message: 'Пройди быстрый тест, чтобы узнать свой уровень юридической грамотности.',
                buttons: [
                    {id: 'test', type: 'default', text: 'Пройти тест'},
                    {type: 'cancel'}
                ]
            }, (buttonId) => {
                if (buttonId === 'test') {
                    document.getElementById('test').scrollIntoView({behavior: 'smooth'});
                }
            });
        }, 1000);
    }
});

// ============================================
// НАВИГАЦИЯ И UI
// ============================================

function initBackButton() {
    if (!isTg) return;
    
    tg.BackButton.onClick(() => {
        if (document.getElementById('page-lesson').classList.contains('active')) {
            closeLesson();
        } else {
            tg.BackButton.hide();
        }
    });
}

function showPage(page) {
    if (page === 'library') {
        document.getElementById('library').scrollIntoView({behavior: 'smooth'});
    } else if (page === 'home') {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
    
    haptic('light');
}

function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('mobile-open');
    haptic('medium');
}

// ============================================
// БИБЛИОТЕКА УРОКОВ
// ============================================

function renderLibrary(filter = 'all') {
    const grid = document.getElementById('library-grid');
    if (!grid) return;
    
    let lessons = lessonsData;
    if (filter !== 'all') {
        lessons = lessonsData.filter(l => l.category === filter);
    }
    
    grid.innerHTML = lessons.map(lesson => {
        const isCompleted = AppState.completedLessons.includes(lesson.id);
        const isFavorite = AppState.favorites.includes(lesson.id);
        
        return `
            <div class="problem-card ${isCompleted ? 'completed' : ''}" onclick="openLesson(${lesson.id})">
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
    }).join('');
}

function filterLibrary(category) {
    // Обновляем чипсы
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    
    renderLibrary(category);
    haptic('light');
}

// ============================================
// УРОК
// ============================================

function openLesson(id) {
    AppState.currentLessonId = id;
    const lesson = lessonsData.find(l => l.id === id);
    
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-cat').textContent = lesson.categoryName;
    document.getElementById('lesson-type').textContent = lesson.type;
    document.getElementById('lesson-time').textContent = '⏱ ' + lesson.duration;
    document.getElementById('lesson-xp').textContent = `+${lesson.xp} XP`;
    document.getElementById('lesson-content').innerHTML = lesson.content;
    
    // Прогресс-бар (если начат но не завершён)
    const progressBar = document.getElementById('lesson-progress');
    if (AppState.completedLessons.includes(id)) {
        progressBar.style.width = '100%';
        progressBar.classList.add('completed');
    } else {
        progressBar.style.width = '0%';
        progressBar.classList.remove('completed');
    }
    
    // Статус
    const completedBadge = document.getElementById('lesson-completed');
    const completeBtn = document.getElementById('mark-complete-btn');
    
    if (AppState.completedLessons.includes(id)) {
        completedBadge.style.display = 'inline';
        completeBtn.innerHTML = '✓ Уже пройдено';
        completeBtn.style.opacity = '0.6';
        completeBtn.disabled = true;
    } else {
        completedBadge.style.display = 'none';
        completeBtn.innerHTML = '✓ Я всё понял';
        completeBtn.style.opacity = '1';
        completeBtn.disabled = false;
    }
    
    // Избранное
    updateFavoriteButton();
    
    // Показываем страницу
    document.getElementById('page-lesson').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (isTg) {
        tg.BackButton.show();
        haptic('medium');
    }
    
    window.scrollTo(0, 0);
    
    // Отслеживание прогресса чтения
    trackReadingProgress();
}

function closeLesson() {
    document.getElementById('page-lesson').classList.remove('active');
    document.body.style.overflow = '';
    
    if (isTg) {
        tg.BackButton.hide();
    }
    
    AppState.currentLessonId = null;
}

function trackReadingProgress() {
    // Простая логика: если пользователь доскроллил до конца, показываем кнопку
    const content = document.querySelector('.lesson-content-box');
    if (!content) return;
    
    let scrolled = false;
    content.addEventListener('scroll', () => {
        if (!scrolled && content.scrollTop + content.clientHeight >= content.scrollHeight - 100) {
            scrolled = true;
            document.getElementById('mark-complete-btn').classList.add('pulse');
        }
    });
}

async function markComplete() {
    const id = AppState.currentLessonId;
    if (!id || AppState.completedLessons.includes(id)) return;
    
    const lesson = lessonsData.find(l => l.id === id);
    
    // Сохраняем прогресс
    AppState.completedLessons.push(id);
    AppState.streak++;
    AppState.lastVisit = new Date().toISOString();
    AppState.addXP(lesson.xp);
    
    await AppState.save();
    
    // UI-реакция
    const btn = document.getElementById('mark-complete-btn');
    btn.innerHTML = '✓ Сохранено!';
    btn.style.background = 'var(--accent)';
    btn.style.color = 'var(--bg)';
    btn.disabled = true;
    
    document.getElementById('lesson-completed').style.display = 'inline';
    
    haptic('success');
    
    // Показываем попап
    if (isTg) {
        tg.showPopup({
            title: 'Урок пройден! 🎉',
            message: `Ты получил ${lesson.xp} XP! Всего пройдено: ${AppState.completedLessons.length}/${lessonsData.length}`,
            buttons: [
                {id: 'next', type: 'default', text: 'Следующий урок'},
                {type: 'cancel'}
            ]
        }, (buttonId) => {
            if (buttonId === 'next') {
                nextLesson();
            } else {
                closeLesson();
                updateProgress();
                renderLibrary();
            }
        });
    } else {
        setTimeout(() => {
            closeLesson();
            updateProgress();
            renderLibrary();
        }, 1500);
    }
}

function toggleFavorite() {
    const id = AppState.currentLessonId;
    const index = AppState.favorites.indexOf(id);
    
    if (index > -1) {
        AppState.favorites.splice(index, 1);
        haptic('light');
    } else {
        AppState.favorites.push(id);
        haptic('success');
    }
    
    AppState.save();
    updateFavoriteButton();
    renderLibrary(); // Обновляем иконки в сетке
}

function updateFavoriteButton() {
    const btn = document.getElementById('fav-btn');
    const isFav = AppState.favorites.includes(AppState.currentLessonId);
    
    btn.classList.toggle('active', isFav);
    btn.textContent = isFav ? '★' : '☆';
}

function nextLesson() {
    const currentIndex = lessonsData.findIndex(l => l.id === AppState.currentLessonId);
    if (currentIndex < lessonsData.length - 1) {
        openLesson(lessonsData[currentIndex + 1].id);
    } else {
        if (isTg) tg.showAlert('Это последний урок! Ты молодец! 🎉');
    }
}

function prevLesson() {
    const currentIndex = lessonsData.findIndex(l => l.id === AppState.currentLessonId);
    if (currentIndex > 0) {
        openLesson(lessonsData[currentIndex - 1].id);
    }
}

function continueLearning() {
    const nextLesson = lessonsData.find(l => !AppState.completedLessons.includes(l.id));
    if (nextLesson) {
        openLesson(nextLesson.id);
    } else {
        if (isTg) {
            tg.showPopup({
                title: 'Все уроки пройдены! 🏆',
                message: 'Ты прошел все бесплатные уроки. Готов к продвинутому курсу?',
                buttons: [
                    {id: 'pay', type: 'default', text: 'Посмотреть тарифы'},
                    {type: 'cancel'}
                ]
            }, (buttonId) => {
                if (buttonId === 'pay') {
                    document.getElementById('pricing').scrollIntoView({behavior: 'smooth'});
                }
            });
        }
    }
}

// ============================================
// ПРОГРЕСС И СТАТИСТИКА
// ============================================

function updateProgress() {
    const count = AppState.completedLessons.length;
    const total = lessonsData.length;
    const percent = Math.round((count / total) * 100);
    
    // Обновляем счётчики
    const counter = document.getElementById('completed-counter');
    if (counter) counter.textContent = count;
    
    // Обновляем круговой прогресс (если есть)
    const circle = document.querySelector('.progress-circle');
    if (circle) {
        circle.style.setProperty('--progress', `${percent}%`);
    }
    
    // Обновляем карточки проблем
    document.querySelectorAll('.problem-card').forEach((card, index) => {
        const lessonId = index + 1;
        card.classList.toggle('completed', AppState.completedLessons.includes(lessonId));
    });
}

// ============================================
// КВИЗ
// ============================================

let quizScore = 0;
let currentQuestion = 1;

function answer(question, isCorrect) {
    if (isCorrect) quizScore++;
    
    // Анимация исчезновения
    const current = document.querySelector(`[data-question="${question}"]`);
    current.style.opacity = '0';
    current.style.transform = 'translateX(-20px)';
    
    haptic('light');
    
    setTimeout(() => {
        current.classList.remove('active');
        
        if (question < 3) {
            const next = document.querySelector(`[data-question="${question + 1}"]`);
            next.classList.add('active');
            currentQuestion = question + 1;
        } else {
            showResult();
        }
    }, 300);
}

function showResult() {
    const resultDiv = document.getElementById('quiz-result');
    const title = document.getElementById('result-title');
    const text = document.getElementById('result-text');
    
    resultDiv.classList.add('show');
    haptic('success');
    
    let resultText = '';
    let recommendation = '';
    
    if (quizScore === 3) {
        resultText = '🔥 Ты юридически подкован!';
        recommendation = 'Ты разбираешься в базовых ситуациях лучше 80% населения. Попробуй продвинутые уроки.';
        AppState.addXP(30); // Бонус за тест
    } else if (quizScore === 2) {
        resultText = '⚡️ Неплохо, но есть пробелы';
        recommendation = 'Рекомендуем пройти базовый курс по аренде и трудовым договорам.';
    } else {
        resultText = '📚 Пора учиться';
        recommendation = 'Начни с бесплатного раздела SOS. Это займёт 15 минут, но сэкономит тебе нервы и деньги.';
    }
    
    title.textContent = resultText;
    text.textContent = `${recommendation} Правильных ответов: ${quizScore}/3`;
    
    // Кнопка шеринга
    if (isTg) {
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn btn-secondary';
        shareBtn.innerHTML = '📤 Поделиться результатом';
        shareBtn.onclick = shareResults;
        resultDiv.appendChild(shareBtn);
    }
}

function shareResults() {
    if (!isTg) return;
    
    const text = `Я набрал ${quizScore}/3 в тесте на юридическую грамотность! А ты сможешь лучше? 👇`;
    
    tg.openTelegramLink(`https://t.me/share/url?url=https://t.me/prostoepravo_bot&text=${encodeURIComponent(text)}`);
}

// ============================================
// ПЛАТЕЖИ
// ============================================

function initPayment(amount, plan) {
    if (!isTg) {
        alert('Оплата доступна только в Telegram. Откройте приложение через бота.');
        return;
    }
    
    // Показываем MainButton
    tg.MainButton.setText(`Оплатить ${amount.toLocaleString()}₽`);
    tg.MainButton.setParams({
        color: '#00ff88',
        textColor: '#0a0a0a'
    });
    tg.MainButton.show();
    
    // Обработчик клика
    tg.MainButton.onClick(() => {
        // Здесь интеграция с вашим бэкендом для создания инвойса
        // Пример с Telegram Stars:
        tg.openInvoice({
            url: `https://api.yoursite.com/create-invoice?amount=${amount}&plan=${plan}&user_id=${tg.initDataUnsafe?.user?.id}`
        }, (status) => {
            if (status === 'paid') {
                tg.showAlert('Оплата прошла успешно! Добро пожаловать в клуб 💚');
                AppState.addXP(200); // Бонус за покупку
            } else {
                tg.showAlert('Оплата отменена');
            }
            tg.MainButton.hide();
        });
    });
}

// ============================================
// РЕФЕРАЛЬНАЯ СИСТЕМА
// ============================================

function checkReferral() {
    if (!isTg) return;
    
    const startParam = tg.initDataUnsafe?.start_param;
    if (startParam?.startsWith('ref_')) {
        const refCode = startParam.replace('ref_', '');
        console.log('Реферальный код:', refCode);
        
        // Отправляем на сервер
        // fetch('/api/referral', {method: 'POST', body: JSON.stringify({ref: refCode})});
        
        AppState.addXP(50); // Бонус за переход по рефералке
    }
}

// ============================================
// УТИЛИТЫ
// ============================================

function haptic(type) {
    if (!isTg || !tg.HapticFeedback) return;
    
    switch(type) {
        case 'light':
            tg.HapticFeedback.impactOccurred('light');
            break;
        case 'medium':
            tg.HapticFeedback.impactOccurred('medium');
            break;
        case 'heavy':
            tg.HapticFeedback.impactOccurred('heavy');
            break;
        case 'success':
            tg.HapticFeedback.notificationOccurred('success');
            break;
        case 'error':
            tg.HapticFeedback.notificationOccurred('error');
            break;
    }
}

// Свайпы для мобильных
let touchStartY = 0;
let touchStartX = 0;

document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    const touchEndY = e.changedTouches[0].screenY;
    const touchEndX = e.changedTouches[0].screenX;
    
    const deltaY = touchStartY - touchEndY;
    const deltaX = touchStartX - touchEndX;
    
    // Свайп влево/вправо для переключения уроков
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (document.getElementById('page-lesson').classList.contains('active')) {
            if (deltaX > 0) {
                nextLesson(); // Свайп влево — следующий
            } else {
                prevLesson(); // Свайп вправо — предыдущий
            }
        }
    }
});
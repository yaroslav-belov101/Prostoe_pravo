// script.js — Оригинальная логика + Учебник + TWA

// Данные уроков
const lessonsData = [
    {
        id: 1,
        title: "Как не потерять депозит за квартиру",
        category: "rent",
        categoryName: "🏠 Аренда",
        type: "📄 Статья",
        duration: "5 мин",
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
        content: `
            <h2>Проверь эти пункты перед подписанием</h2>
            <ul>
                <li>Срок испытательного срока (не более 3 месяцев)</li>
                <li>Дата выдачи зарплаты (должна быть конкретной цифрой, не «до 10-го»)</li>
                <li>Условия увольнения (нельзя уволить без объяснения причин)</li>
            </ul>
            
            <h2>Фриланс vs Трудовой договор</h2>
            <p>Если тебя заставляют оформляться как самозанятого, но ты ходишь в офис 5/2 — это незаконно. Ты должен быть в штате.</p>
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
    }
];

// Состояние
let currentLessonId = null;
let completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    renderLibrary();
    
    // TWA BackButton
    tg.BackButton.onClick(() => {
        if (document.getElementById('page-lesson').classList.contains('active')) {
            closeLesson();
        } else {
            tg.BackButton.hide();
        }
    });
});

// Обновление прогресса
function updateProgress() {
    const count = completedLessons.length;
    document.getElementById('completed-counter').textContent = count;
    
    // Обновляем карточки
    document.querySelectorAll('.problem-card').forEach((card, index) => {
        const lessonId = index + 1;
        if (completedLessons.includes(lessonId)) {
            card.classList.add('completed');
        }
    });
}

// Рендер библиотеки
function renderLibrary(filter = 'all') {
    const grid = document.getElementById('library-grid');
    if (!grid) return;
    
    let lessons = lessonsData;
    if (filter !== 'all') {
        lessons = lessonsData.filter(l => l.category === filter);
    }
    
    grid.innerHTML = lessons.map(lesson => `
        <div class="problem-card ${completedLessons.includes(lesson.id) ? 'completed' : ''}" onclick="openLesson(${lesson.id})">
            <span class="icon">${lesson.categoryName.split(' ')[0]}</span>
            <span class="lesson-category-tag">${lesson.categoryName}</span>
            <h3>${lesson.title}</h3>
            <p>${lesson.type} • ${lesson.duration}</p>
            <span class="link-arrow">Открыть урок →</span>
        </div>
    `).join('');
}

// Фильтрация
function filterLibrary(category) {
    // Обновляем чипсы
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    
    renderLibrary(category);
    
    // Haptic
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

// Открыть урок
function openLesson(id) {
    currentLessonId = id;
    const lesson = lessonsData.find(l => l.id === id);
    
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-cat').textContent = lesson.categoryName;
    document.getElementById('lesson-type').textContent = lesson.type;
    document.getElementById('lesson-time').textContent = '⏱ ' + lesson.duration;
    document.getElementById('lesson-content').innerHTML = lesson.content;
    
    // Показываем "Пройдено" если нужно
    const completedBadge = document.getElementById('lesson-completed');
    const completeBtn = document.getElementById('mark-complete-btn');
    
    if (completedLessons.includes(id)) {
        completedBadge.style.display = 'inline';
        completeBtn.textContent = '✓ Уже пройдено';
        completeBtn.style.opacity = '0.6';
    } else {
        completedBadge.style.display = 'none';
        completeBtn.textContent = '✓ Я всё понял';
        completeBtn.style.opacity = '1';
    }
    
    // Избранное
    const favBtn = document.getElementById('fav-btn');
    if (favorites.includes(id)) {
        favBtn.classList.add('active');
        favBtn.textContent = '★';
    } else {
        favBtn.classList.remove('active');
        favBtn.textContent = '☆';
    }
    
    // Показываем страницу
    document.getElementById('page-lesson').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // TWA
    tg.BackButton.show();
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    window.scrollTo(0, 0);
}

// Закрыть урок
function closeLesson() {
    document.getElementById('page-lesson').classList.remove('active');
    document.body.style.overflow = '';
    tg.BackButton.hide();
}

// Отметить как пройденное
function markComplete() {
    if (!completedLessons.includes(currentLessonId)) {
        completedLessons.push(currentLessonId);
        localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
        
        // Анимация кнопки
        const btn = document.getElementById('mark-complete-btn');
        btn.textContent = '✓ Сохранено!';
        btn.style.background = 'var(--accent)';
        btn.style.color = 'var(--bg)';
        
        // Haptic
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        
        // Показываем попап TG
        tg.showPopup({
            title: 'Урок пройден! 🎉',
            message: 'Ты на шаг ближе к защите своих прав',
            buttons: [{type: 'ok'}]
        });
        
        updateProgress();
        renderLibrary();
        
        setTimeout(() => {
            closeLesson();
        }, 1000);
    }
}

// Избранное
function toggleFavorite() {
    const btn = document.getElementById('fav-btn');
    
    if (favorites.includes(currentLessonId)) {
        favorites = favorites.filter(id => id !== currentLessonId);
        btn.classList.remove('active');
        btn.textContent = '☆';
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    } else {
        favorites.push(currentLessonId);
        btn.classList.add('active');
        btn.textContent = '★';
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Навигация между уроками
function nextLesson() {
    const currentIndex = lessonsData.findIndex(l => l.id === currentLessonId);
    if (currentIndex < lessonsData.length - 1) {
        openLesson(lessonsData[currentIndex + 1].id);
    } else {
        tg.showAlert('Это последний урок! 🎉');
    }
}

function prevLesson() {
    const currentIndex = lessonsData.findIndex(l => l.id === currentLessonId);
    if (currentIndex > 0) {
        openLesson(lessonsData[currentIndex - 1].id);
    }
}

// Продолжить обучение
function continueLearning() {
    const nextId = lessonsData.find(l => !completedLessons.includes(l.id))?.id;
    if (nextId) {
        openLesson(nextId);
    } else {
        tg.showAlert('Ты прошел все уроки! Можешь перейти к платным курсам.');
    }
}

// Переключение страниц (для навигации)
function showPage(page) {
    if (page === 'library') {
        document.getElementById('library').scrollIntoView({behavior: 'smooth'});
    } else if (page === 'home') {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
    
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

// Квиз (оригинальный)
let score = 0;
function answer(question, isCorrect) {
    if (isCorrect) score++;
    
    document.querySelector(`[data-question="${question}"]`).classList.remove('active');
    
    if (question < 3) {
        document.querySelector(`[data-question="${question + 1}"]`).classList.add('active');
    } else {
        showResult();
    }
    
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function showResult() {
    const resultDiv = document.getElementById('quiz-result');
    const title = document.getElementById('result-title');
    const text = document.getElementById('result-text');
    
    resultDiv.classList.add('show');
    
    if (score === 3) {
        title.textContent = '🔥 Ты юридически подкован!';
        text.textContent = 'Ты разбираешься в базовых ситуациях лучше 80% населения.';
    } else if (score === 2) {
        title.textContent = '⚡️ Неплохо, но есть пробелы';
        text.textContent = 'Рекомендуем пройти базовый курс.';
    } else {
        title.textContent = '📚 Пора учиться';
        text.textContent = 'Начни с бесплатного раздела SOS.';
    }
}

// Мобильное меню
function toggleMobileMenu() {
    // Простая реализация - можно расширить
    tg.showAlert('Меню: используй прокрутку для навигации');
}

// Свайпы для мобильных
let touchStartY = 0;
document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', e => {
    const touchEndY = e.changedTouches[0].screenY;
    if (touchStartY - touchEndY > 100) {
        // Свайп вверх - можно добавить логику
    }
});
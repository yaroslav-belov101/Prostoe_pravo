// script.js — Полноценная логика учебника + TWA

// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Настройка цветов под Telegram
tg.setHeaderColor('#0a0a0a');
tg.setBackgroundColor('#0a0a0a');

// Данные уроков (в реальном приложении это приходит с API)
const lessons = [
    {
        id: 1,
        title: "Как не потерять депозит за квартиру",
        category: "rent",
        type: "article",
        duration: "5 мин",
        icon: "🏠",
        content: `
            <h2>Акт приема-передачи — твой щит</h2>
            <p>При заселении сфотографируй ВСЕ: стены, окна, бытовую технику, даже розетки. Это доказательства.</p>
            <h2>3 красных флага в договоре</h2>
            <ul>
                <li>Арендодатель отказывается подписывать акт</li>
                <li>В договоре нет срока возврата депозита</li>
                <li>Указана «комиссия за уборку»</li>
            </ul>
        `,
        checklist: ["Сфотографировать все до мелочей", "Зафиксировать показания счетчиков", "Подписать акт с арендодателем"],
        quiz: {
            question: "Что делать, если арендодатель не подписывает акт приема-передачи?",
            options: ["Заселиться и не париться", "Отказаться от сделки или сделать фото с геолокацией", "Подписать без него"],
            correct: 1
        }
    },
    {
        id: 2,
        title: "Трудовой договор: где тебя разводят",
        category: "work",
        type: "video",
        duration: "8 мин",
        icon: "💼",
        content: "<p>Видео-урок о скрытых пунктах в ТК...</p>",
        checklist: ["Проверить срок испытательного срока", "Уточнить условия увольнения", "Зафиксировать оклад цифрами"],
        quiz: null
    },
    {
        id: 3,
        title: "Коллекторы: как отбиться от звонков",
        category: "money",
        type: "checklist",
        duration: "3 мин",
        icon: "💸",
        content: "<p>Пошаговая инструкция по защите от коллекторов...</p>",
        checklist: ["Записать разговор", "Потребовать документы о долге", "Направить заявление о прекращении обработки данных"],
        quiz: null
    },
    {
        id: 4,
        title: "Штрафы ГИБДД: что реально надо платить",
        category: "docs",
        type: "article",
        duration: "6 мин",
        icon: "🚗",
        content: "<p>Разбираем законные и незаконные штрафы...</p>",
        checklist: ["Проверить фото нарушения", "Убедиться в подписи инспектора"],
        quiz: null
    }
];

// Состояние приложения
let currentLessonId = null;
let completedLessons = JSON.parse(localStorage.getItem('completed') || '[]');
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderFeatured();
    renderLibrary();
    updateProgress();
    
    // Если есть сохраненный прогресс в TG CloudStorage (опционально)
    if (tg.CloudStorage) {
        tg.CloudStorage.getItem('progress', (err, value) => {
            if (!err && value) {
                completedLessons = JSON.parse(value);
                updateProgress();
            }
        });
    }
});

// Навигация по секциям
function showSection(sectionName) {
    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    // Скрываем все секции
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Показываем нужную
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    // Управление кнопкой "Назад" в Telegram
    if (sectionName === 'home') {
        tg.BackButton.hide();
        tg.MainButton.hide();
    } else {
        tg.BackButton.show();
        tg.BackButton.onClick(() => showSection('home'));
    }
    
    // Специальные кнопки для урока
    if (sectionName === 'lesson') {
        tg.MainButton.setText('✓ Я всё понял');
        tg.MainButton.show();
        tg.MainButton.onClick(() => markComplete());
    } else {
        tg.MainButton.hide();
    }
    
    window.scrollTo(0, 0);
}

// Рендер популярных уроков
function renderFeatured() {
    const container = document.getElementById('featured-grid');
    const featured = lessons.slice(0, 3);
    
    container.innerHTML = featured.map(lesson => createLessonCard(lesson)).join('');
}

// Рендер библиотеки
function renderLibrary(filter = 'all') {
    const container = document.getElementById('library-grid');
    let filtered = lessons;
    
    if (filter !== 'all') {
        filtered = lessons.filter(l => l.category === filter || l.type === filter);
    }
    
    container.innerHTML = filtered.map(lesson => createLessonCard(lesson)).join('');
}

// Создание карточки урока
function createLessonCard(lesson) {
    const isCompleted = completedLessons.includes(lesson.id);
    const typeIcon = lesson.type === 'video' ? '🎥' : lesson.type === 'checklist' ? '✅' : '📄';
    
    return `
        <div class="lesson-card ${isCompleted ? 'completed' : ''}" onclick="openLesson(${lesson.id})">
            <div class="lesson-thumb">
                ${lesson.icon}
                <span class="lesson-type-icon">${typeIcon}</span>
            </div>
            <div class="lesson-info">
                <span class="lesson-category-tag">${getCategoryName(lesson.category)}</span>
                <h3>${lesson.title}</h3>
                <div class="lesson-meta-card">
                    <span>⏱ ${lesson.duration}</span>
                    <span>${isCompleted ? '✓ Пройдено' : 'Новое'}</span>
                </div>
            </div>
        </div>
    `;
}

// Открытие урока
function openLesson(id) {
    currentLessonId = id;
    const lesson = lessons.find(l => l.id === id);
    
    // Заполняем контент
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-category').textContent = getCategoryName(lesson.category);
    document.getElementById('lesson-type').textContent = getTypeName(lesson.type);
    document.getElementById('lesson-time').textContent = lesson.duration;
    document.getElementById('lesson-content').innerHTML = lesson.content;
    
    // Показываем/скрываем видео
    const videoContainer = document.getElementById('video-container');
    videoContainer.style.display = lesson.type === 'video' ? 'block' : 'none';
    
    // Чек-лист
    const checklistSection = document.getElementById('checklist-section');
    if (lesson.checklist) {
        checklistSection.style.display = 'block';
        document.getElementById('checklist-items').innerHTML = 
            lesson.checklist.map(item => `<li>${item}</li>`).join('');
    } else {
        checklistSection.style.display = 'none';
    }
    
    // Кнопка избранного
    updateFavoriteBtn();
    
    // Показываем секцию
    showSection('lesson');
    
    // Haptic
    tg.HapticFeedback.impactOccurred('medium');
}

// Отметить как пройденное
function markComplete() {
    if (!completedLessons.includes(currentLessonId)) {
        completedLessons.push(currentLessonId);
        localStorage.setItem('completed', JSON.stringify(completedLessons));
        
        // Сохраняем в облако TG если доступно
        if (tg.CloudStorage) {
            tg.CloudStorage.setItem('progress', JSON.stringify(completedLessons));
        }
        
        // Уведомление
        tg.showPopup({
            title: '✅ Урок пройден!',
            message: 'Ты стал на шаг ближе к юридической грамотности',
            buttons: [{type: 'ok'}]
        });
        
        tg.HapticFeedback.notificationOccurred('success');
        updateProgress();
        renderLibrary(); // Обновить галочки
    }
    
    showSection('library');
}

// Прогресс обучения
function updateProgress() {
    const total = lessons.length;
    const completed = completedLessons.length;
    const percent = Math.round((completed / total) * 100);
    
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('completed-total').textContent = completed;
    document.getElementById('total-lessons').textContent = total;
    document.getElementById('progress-text').textContent = percent + '%';
    
    // Обновляем круг прогресса
    const circle = document.getElementById('progress-ring');
    const dashArray = (percent / 100) * 100;
    circle.style.strokeDasharray = `${dashArray}, 100`;
    
    // Обновляем MainButton на главной
    if (completed === 0) {
        tg.MainButton.setText('Начать обучение');
    } else {
        tg.MainButton.setText(`Продолжить (${percent}%)`);
    }
}

// Продолжить обучение (с последнего непройденного)
function continueLearning() {
    const nextLesson = lessons.find(l => !completedLessons.includes(l.id));
    if (nextLesson) {
        openLesson(nextLesson.id);
    } else {
        tg.showAlert('🎉 Ты прошел все уроки! Теперь ты юридически подкован.');
    }
}

// Избранное
function toggleFavorite() {
    if (favorites.includes(currentLessonId)) {
        favorites = favorites.filter(id => id !== currentLessonId);
        tg.HapticFeedback.impactOccurred('light');
    } else {
        favorites.push(currentLessonId);
        tg.HapticFeedback.notificationOccurred('success');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteBtn();
}

function updateFavoriteBtn() {
    const btn = document.getElementById('fav-btn');
    if (favorites.includes(currentLessonId)) {
        btn.classList.add('active');
        btn.textContent = '★';
    } else {
        btn.classList.remove('active');
        btn.textContent = '☆';
    }
}

// Фильтры и поиск
function filterByCategory(category) {
    // Обновляем активный чип
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    
    renderLibrary(category === 'all' ? 'all' : category);
    tg.HapticFeedback.impactOccurred('light');
}

function searchLessons(query) {
    const container = document.getElementById('library-grid');
    const filtered = lessons.filter(l => 
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.category.includes(query.toLowerCase())
    );
    
    container.innerHTML = filtered.map(lesson => createLessonCard(lesson)).join('');
}

// Вспомогательные функции
function getCategoryName(cat) {
    const map = {
        'rent': '🏠 Аренда',
        'work': '💼 Работа',
        'money': '💸 Деньги',
        'docs': '📝 Документы'
    };
    return map[cat] || cat;
}

function getTypeName(type) {
    const map = {
        'video': '🎥 Видео',
        'article': '📄 Статья',
        'checklist': '✅ Чек-лист'
    };
    return map[type] || type;
}

// Навигация между уроками
function nextLesson() {
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex < lessons.length - 1) {
        openLesson(lessons[currentIndex + 1].id);
    }
}

function prevLesson() {
    const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex > 0) {
        openLesson(lessons[currentIndex - 1].id);
    }
}

// Мобильное меню
function toggleMenu() {
    document.getElementById('mobile-menu').classList.toggle('show');
}

function goBack() {
    showSection('home');
}

// Воспроизведение видео (заглушка)
function playVideo() {
    tg.showAlert('▶️ Воспроизведение видео...');
    tg.HapticFeedback.impactOccurred('medium');
}

// Обработка свайпов (для мобильных)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 100) {
        // Свайп влево - следующий урок (если в уроке)
        if (document.getElementById('section-lesson').classList.contains('active')) {
            nextLesson();
        }
    }
    if (touchEndX > touchStartX + 100) {
        // Свайп вправо - назад
        if (!document.getElementById('section-home').classList.contains('active')) {
            goBack();
        }
    }
}
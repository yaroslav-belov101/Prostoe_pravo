// ============================================
// УТИЛИТЫ И ПОМОЩНИКИ
// ============================================

const Utils = {
    // Проверка окружения
    isTelegram() {
        return !!window.Telegram?.WebApp;
    },
    
    // Безопасный вызов TWA метода
    tg(method, ...args) {
        if (this.isTelegram() && window.Telegram.WebApp[method]) {
            try {
                return window.Telegram.WebApp[method](...args);
            } catch (e) {
                console.warn(`TWA error: ${method}`, e);
            }
        }
        return null;
    },
    
    // Haptic feedback
    haptic(type = 'light') {
        const feedback = window.Telegram?.WebApp?.HapticFeedback;
        if (!feedback) return;
        
        const types = {
            light: () => feedback.impactOccurred('light'),
            medium: () => feedback.impactOccurred('medium'),
            heavy: () => feedback.impactOccurred('heavy'),
            success: () => feedback.notificationOccurred('success'),
            error: () => feedback.notificationOccurred('error'),
            warning: () => feedback.notificationOccurred('warning')
        };
        
        (types[type] || types.light)();
    },
    
    // Показать уведомление (Toast)
    toast(message, duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    },
    
    // Форматирование чисел
    formatNumber(num) {
        return num.toLocaleString('ru-RU');
    },
    
    // Дебаунс
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Генерация ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Глубокое клонирование
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Прокрутка к элементу
    scrollTo(element, offset = 80) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    },
    
    // Проверка видимости элемента
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Throttle
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};
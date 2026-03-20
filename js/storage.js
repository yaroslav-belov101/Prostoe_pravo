// ============================================
// РАБОТА С ХРАНИЛИЩЕМ (localStorage / CloudStorage)
// ============================================

const Storage = {
    // Префикс для ключей
    PREFIX: 'prostoepravo_',
    
    // Проверка доступности CloudStorage
    hasCloudStorage() {
        return Utils.isTelegram() && !!window.Telegram.WebApp.CloudStorage;
    },
    
    // Получить ключ с префиксом
    key(name) {
        return this.PREFIX + name;
    },
    
    // Сохранить
    async set(name, value) {
        const key = this.key(name);
        const data = JSON.stringify(value);
        
        if (this.hasCloudStorage()) {
            try {
                await window.Telegram.WebApp.CloudStorage.setItem(key, data);
                return true;
            } catch (e) {
                console.log('CloudStorage failed, falling back to localStorage');
            }
        }
        
        try {
            localStorage.setItem(key, data);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
    
    // Получить
    async get(name, defaultValue = null) {
        const key = this.key(name);
        
        if (this.hasCloudStorage()) {
            try {
                const data = await window.Telegram.WebApp.CloudStorage.getItem(key);
                if (data) return JSON.parse(data);
            } catch (e) {
                console.log('CloudStorage failed, falling back to localStorage');
            }
        }
        
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },
    
    // Удалить
    async remove(name) {
        const key = this.key(name);
        
        if (this.hasCloudStorage()) {
            try {
                await window.Telegram.WebApp.CloudStorage.removeItem(key);
                return true;
            } catch (e) {}
        }
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Очистить всё
    async clear() {
        if (this.hasCloudStorage()) {
            // CloudStorage не поддерживает clearAll, удаляем по одному
            const keys = ['state', 'completed', 'favorites', 'achievements'];
            for (const key of keys) {
                await this.remove(key);
            }
            return true;
        }
        
        // Очищаем только наши ключи
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.PREFIX))
            .forEach(key => localStorage.removeItem(key));
        
        return true;
    }
};
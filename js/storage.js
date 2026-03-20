// ============================================
// РАБОТА С ХРАНИЛИЩЕМ
// ============================================
const Storage = {
    PREFIX: 'prostoepravo_',

    hasCloudStorage() {
        return Utils.isTelegram() && !!window.Telegram.WebApp.CloudStorage;
    },

    key(name) {
        return this.PREFIX + name;
    },

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

    async get(name, defaultValue = null) {
        const key = this.key(name);
        
        if (this.hasCloudStorage()) {
            try {
                const data = await window.Telegram.WebApp.CloudStorage.getItem(key);
                if (data) {
                    // ✅ ИСПРАВЛЕНО: try-catch для JSON.parse
                    try {
                        return JSON.parse(data);
                    } catch (e) {
                        console.error('JSON parse error:', e);
                        return defaultValue;
                    }
                }
            } catch (e) {
                console.log('CloudStorage failed, falling back to localStorage');
            }
        }
        
        try {
            const data = localStorage.getItem(key);
            // ✅ ИСПРАВЛЕНО: try-catch для JSON.parse
            if (data) {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    console.error('JSON parse error:', e);
                    return defaultValue;
                }
            }
            return defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },

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

    async clear() {
        if (this.hasCloudStorage()) {
            const keys = ['state', 'completed', 'favorites', 'achievements'];
            for (const key of keys) {
                await this.remove(key);
            }
            return true;
        }
        
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.PREFIX))
            .forEach(key => localStorage.removeItem(key));
        
        return true;
    }
};
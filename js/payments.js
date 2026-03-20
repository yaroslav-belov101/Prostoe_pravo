// ============================================
// ПЛАТЕЖИ И ПОДПИСКИ
// ============================================

const Payments = {
    currentPlan: null,
    currentAmount: 0,
    
    // Инициализация оплаты
    init(amount, plan) {
        this.currentAmount = amount;
        this.currentPlan = plan;
        
        if (!Utils.isTelegram()) {
            this.showDesktopPayment();
            return;
        }
        
        // Показываем MainButton в TWA
        const TWA = window.Telegram.WebApp;
        
        TWA.MainButton.setText(`Оплатить ${Utils.formatNumber(amount)}₽`);
        TWA.MainButton.setParams({
            color: '#00ff88',
            text_color: '#0a0a0a',
            is_active: true,
            is_visible: true
        });
        
        // Удаляем старый обработчик если есть
        TWA.MainButton.offClick(this.handlePayment);
        
        // Добавляем новый
        TWA.MainButton.onClick(() => this.handlePayment());
        
        Utils.haptic('medium');
    },
    
    // Обработка платежа
    handlePayment() {
        const TWA = window.Telegram.WebApp;
        
        // Здесь должна быть интеграция с вашим бэкендом
        // Пример с Telegram Stars или внешней платёжкой:
        
        TWA.openInvoice({
            url: `https://api.yoursite.com/create-invoice?amount=${this.currentAmount}&plan=${this.currentPlan}&user_id=${TWA.initDataUnsafe?.user?.id}`
        }, (status) => {
            TWA.MainButton.hide();
            
            if (status === 'paid') {
                this.onSuccess();
            } else {
                this.onCancel();
            }
        });
    },
    
    // Успешная оплата
    onSuccess() {
        State.addXP(CONFIG.XP.PURCHASE);
        
        Utils.tg('showPopup', {
            title: 'Оплата прошла успешно! 💚',
            message: 'Добро пожаловать в клуб. Теперь тебе доступны все материалы!',
            buttons: [{ type: 'ok' }]
        });
        
        Utils.haptic('success');
        
        // Сохраняем статус подписки
        State.data.subscription = {
            plan: this.currentPlan,
            active: true,
            activatedAt: new Date().toISOString()
        };
        State.save();
    },
    
    // Отмена оплаты
    onCancel() {
        Utils.toast('Оплата отменена');
    },
    
    // Показать десктопную версию оплаты
    showDesktopPayment() {
        // На ПК показываем модальное окно с инструкцией
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                <h3>Оплата через Telegram</h3>
                <p>Для оплаты подписки откройте это приложение в Telegram.</p>
                <p style="margin-top: 1rem; padding: 1rem; background: var(--bg); border-radius: 8px; font-family: monospace;">
                    @${CONFIG.BOT_USERNAME}
                </p>
                <button class="btn btn-primary" onclick="window.open('https://t.me/${CONFIG.BOT_USERNAME}', '_blank')" style="margin-top: 1rem;">
                    Открыть в Telegram
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    // Проверка статуса подписки
    hasActiveSubscription() {
        return State.data.subscription?.active === true;
    }
};
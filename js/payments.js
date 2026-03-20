// ============================================
// ПЛАТЕЖИ И ПОДПИСКИ
// ============================================
const Payments = {
    currentPlan: null,
    currentAmount: 0,
    boundHandlePayment: null,

    init(amount, plan) {
        this.currentAmount = amount;
        this.currentPlan = plan;
        
        if (!Utils.isTelegram()) {
            this.showDesktopPayment();
            return;
        }

        const TWA = window.Telegram.WebApp;
        
        TWA.MainButton.setText(`Оплатить ${Utils.formatNumber(amount)}₽`);
        TWA.MainButton.setParams({
            color: '#00ff88',
            text_color: '#0a0a0a',
            is_active: true,
            is_visible: true
        });

        // ✅ ИСПРАВЛЕНО: Сохраняем ссылку на обработчик
        if (this.boundHandlePayment) {
            TWA.MainButton.offClick(this.boundHandlePayment);
        }
        
        this.boundHandlePayment = this.handlePayment.bind(this);
        TWA.MainButton.onClick(this.boundHandlePayment);
        
        Utils.haptic('medium');
    },

    handlePayment() {
        const TWA = window.Telegram.WebApp;
        
        // ✅ ИСПРАВЛЕНО: Правильная работа с invoice
        const invoiceUrl = `https://api.yoursite.com/create-invoice?amount=${this.currentAmount}&plan=${this.currentPlan}&user_id=${TWA.initDataUnsafe?.user?.id}`;
        
        // Подписываемся на событие закрытия invoice
        const onInvoiceClosed = (invoice) => {
            TWA.MainButton.hide();
            TWA.offEvent('invoiceClosed', onInvoiceClosed);
            
            if (invoice.status === 'paid') {
                this.onSuccess();
            } else {
                this.onCancel();
            }
        };
        
        TWA.onEvent('invoiceClosed', onInvoiceClosed);
        TWA.openInvoice(invoiceUrl);
    },

    onSuccess() {
        State.addXP(CONFIG.XP.PURCHASE);
        
        Utils.tg('showPopup', {
            title: 'Оплата прошла успешно! 💚',
            message: 'Добро пожаловать в клуб. Теперь тебе доступны все материалы!',
            buttons: [{ type: 'ok' }]
        });
        
        Utils.haptic('success');
        
        State.data.subscription = {
            plan: this.currentPlan,
            active: true,
            activatedAt: new Date().toISOString()
        };
        State.save();
    },

    onCancel() {
        Utils.toast('Оплата отменена');
    },

    showDesktopPayment() {
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

    hasActiveSubscription() {
        return State.data.subscription?.active === true;
    }
};
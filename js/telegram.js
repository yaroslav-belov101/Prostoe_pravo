const tg = window.Telegram?.WebApp;
export const TWA = {
    ready: () => tg?.ready(),
    haptic: (t) => tg?.HapticFeedback?.impactOccurred(t),
    user: () => tg?.initDataUnsafe?.user,
    initData: () => tg?.initData || ''
};
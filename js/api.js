const API = {
base: import.meta.env?.VITE_API_URL || 'http://localhost:8000',
async fetch(endpoint, opts = {}) {
    const initData = window.Telegram?.WebApp?.initData || '';
    const res = await fetch(`${this.base}${endpoint}`, {
    ...opts,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `tma ${initData}`,
        ...opts.headers
    }
    });
    
    if (!res.ok) throw new Error(await res.text());
    return res.json();
},

get: (url) => API.fetch(url),
post: (url, data) => API.fetch(url, { method: 'POST', body: JSON.stringify(data) }),
patch: (url, data) => API.fetch(url, { method: 'PATCH', body: JSON.stringify(data) })
};
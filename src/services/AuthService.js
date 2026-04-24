// AuthService.js
export const AuthService = {
    async login(email, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid credentials');
                } else if (response.status === 502 || response.status === 504 || response.status === 404) {
                    throw new Error('Backend server is down or unreachable.');
                }
                throw new Error(`Server Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Backend server is down or unreachable.');
            }
            throw error;
        }
    },

    async register(name, email, phone, password) {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, password })
            });
            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('An account with this email already exists.');
                } else if (response.status === 502 || response.status === 504 || response.status === 404) {
                    throw new Error('Backend server is down or unreachable.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || `Server Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
             console.error('Register error:', error);
             if (error.message.includes('Failed to fetch')) {
                 throw new Error('Backend server is down or unreachable.');
             }
             throw error;
        }
    },

    async logout() {
        await fetch('/api/logout', { method: 'POST' });
    },

    async getSession() {
        try {
            const response = await fetch('/api/session');
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            return null;
        }
    },

    async getCart() {
        try {
            const response = await fetch('/api/cart');
            if (!response.ok) return [];
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            return [];
        }
    },

    async saveCart(items) {
        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    },

    async getAdminData() {
        try {
            const response = await fetch('/api/admin/data');
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};

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
                throw new Error('Invalid credentials');
            }
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async logout() {
        await fetch('/api/logout', { method: 'POST' });
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

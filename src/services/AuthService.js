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
                } else if (response.status === 500) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.error || 'Internal server error. Please try again.');
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
    },

    async getUsers() {
        try {
            const response = await fetch('/api/admin/users');
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            throw error;
        }
    },

    async checkout(items) {
        try {
            const response = await fetch('/api/orders/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Checkout failed');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async getOrderHistory() {
        try {
            const response = await fetch('/api/orders/history');
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async getAdminOrders() {
        try {
            const response = await fetch('/api/admin/orders');
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Failed to update status');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async deleteUser(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Failed to delete user');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async subscribeNewsletter(email) {
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Failed to subscribe');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async broadcastNewsletter(subject, message) {
        try {
            const response = await fetch('/api/admin/newsletter/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Failed to send broadcast');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async getWhatsAppConversations() {
        try {
            const response = await fetch('/api/admin/whatsapp/messages');
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Failed to fetch conversations');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async sendWhatsAppMessage(phone, message) {
        try {
            const response = await fetch('/api/admin/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.error || 'Failed to send message');
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};

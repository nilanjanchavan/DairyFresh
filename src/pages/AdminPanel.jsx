import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService.js';

function AdminPanel({ isDarkMode, showToast }) {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAdminData() {
            try {
                const response = await AuthService.getAdminData();
                setData(response);
                setLoading(false);
            } catch (error) {
                if (showToast) showToast('Unauthorized access. Please login.', 'error');
                navigate('/login');
            }
        }
        loadAdminData();
    }, [navigate, showToast]);

    async function handleLogout() {
        await AuthService.logout();
        if (showToast) showToast('Logged out successfully', 'success');
        navigate('/login');
    }

    if (loading) {
        return (
            <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: '#2ecc71' }}>Loading secure panel...</h2>
            </div>
        );
    }

    return (
        <div className="container" style={{ width: '100vw', padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'block' }}>
            <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: '#1e9e3e' }}>Admin Dashboard</h1>
                    <p style={{ color: '#2ecc71' }}>Minimalist overview of DairyFresh metrics</p>
                </div>
                <button className="btn btn-small" onClick={handleLogout} style={{ backgroundColor: '#e74c3c' }}>Logout</button>
            </div>

            <div className="stats-section" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '100% maxWidth: 900px' }}>
                <div className="stat-card" style={{ borderColor: '#2ecc71', borderWidth: 'border: 2px solid' }}>
                    <div className="stat-number">{data.totalUsers}</div>
                    <div style={{ color: '#1e4f2b' }}>Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{data.activeSubscriptions}</div>
                    <div style={{ color: '#1e4f2b' }}>Active Subscriptions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: '#2ecc71' }}>{data.revenue}</div>
                    <div style={{ color: '#1e4f2b' }}>Revenue</div>
                </div>
            </div>

            <div className="about-section mt-4">
                <h2 style={{ color: '#1e9e3e', marginBottom: '15px' }}>Recent Orders</h2>
                <ul style={{ listStyle: 'none' }}>
                    {data.recentOrders && data.recentOrders.map((order, i) => (
                        <li key={i} style={{ 
                            padding: '15px', 
                            borderBottom: '1px solid rgba(46, 204, 113, 0.2)',
                            color: isDarkMode ? '#d0d0d0' : '#1e4f2b',
                            fontSize: '16px'
                        }}>
                            {order}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AdminPanel;

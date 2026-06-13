import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService.js';

function AdminPanel({ isDarkMode, showToast, user }) {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [whatsappMsgs, setWhatsappMsgs] = useState([]);
    const [selectedPhone, setSelectedPhone] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        async function loadData() {
            try {
                const [adminData, usersList, ordersList, wsMsgs] = await Promise.all([
                    AuthService.getAdminData(),
                    AuthService.getUsers(),
                    AuthService.getAdminOrders(),
                    AuthService.getWhatsAppConversations()
                ]);
                setData(adminData);
                setUsers(usersList);
                setOrders(ordersList);
                setWhatsappMsgs(wsMsgs);
                setLoading(false);
            } catch (error) {
                if (showToast) showToast('Failed to load admin data', 'error');
                navigate('/login');
            }
        }
        loadData();
    }, [user, navigate, showToast]);

    async function handleLogout() {
        await AuthService.logout();
        if (showToast) showToast('Logged out successfully', 'success');
        navigate('/login');
    }

    async function handleStatusChange(orderId, newStatus) {
        try {
            await AuthService.updateOrderStatus(orderId, newStatus);
            if (showToast) showToast('Order status updated', 'success');
            // Refresh orders
            const ordersList = await AuthService.getAdminOrders();
            setOrders(ordersList);
        } catch(error) {
            if (showToast) showToast(error.message, 'error');
        }
    }

    async function handleDeleteUser(userId) {
        if (!window.confirm("Are you sure you want to remove this user?")) return;
        try {
            await AuthService.deleteUser(userId);
            if (showToast) showToast('User removed successfully', 'success');
            // Refresh users
            const usersList = await AuthService.getUsers();
            setUsers(usersList);
            const response = await AuthService.getAdminData();
            setData(response);
        } catch(error) {
            if (showToast) showToast(error.message, 'error');
        }
    }

    async function handleBroadcast(event) {
        event.preventDefault();
        const form = event.target;
        const subject = form.subject.value;
        const message = form.message.value;
        
        try {
            await AuthService.broadcastNewsletter(subject, message);
            if (showToast) showToast('Broadcast sent successfully!', 'success');
            form.reset();
        } catch(error) {
            if (showToast) showToast(error.message, 'error');
        }
    }

    async function handleSendWhatsApp(e) {
        e.preventDefault();
        const msg = e.target.message.value;
        if (!selectedPhone || !msg.trim()) return;

        try {
            await AuthService.sendWhatsAppMessage(selectedPhone, msg);
            if (showToast) showToast('WhatsApp message sent!', 'success');
            e.target.reset();
            // Refresh messages
            const msgs = await AuthService.getWhatsAppConversations();
            setWhatsappMsgs(msgs);
        } catch(error) {
            if (showToast) showToast(error.message, 'error');
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    if (loading) {
        return (
            <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: '#2ecc71' }}>Loading secure panel...</h2>
            </div>
        );
    }

    // Group WhatsApp messages by phone
    const conversations = {};
    if (Array.isArray(whatsappMsgs)) {
        whatsappMsgs.forEach(m => {
            if (!conversations[m.phone_number]) conversations[m.phone_number] = [];
            conversations[m.phone_number].push(m);
        });
    }

    return (
        <div className="container" style={{ width: '100vw', padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'block' }}>
            <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: '#1e9e3e' }}>Admin Dashboard</h1>
                    <p style={{ color: '#2ecc71' }}>Manage DairyFresh platform</p>
                </div>
                <button className="btn btn-small" onClick={handleLogout} style={{ backgroundColor: '#e74c3c' }}>Logout</button>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '0',
                marginBottom: '30px',
                borderBottom: '2px solid rgba(46, 204, 113, 0.2)'
            }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                        padding: '12px 28px',
                        border: 'none',
                        borderBottom: activeTab === 'overview' ? '3px solid #2ecc71' : '3px solid transparent',
                        background: 'none',
                        color: activeTab === 'overview' ? '#2ecc71' : (isDarkMode ? '#aaa' : '#666'),
                        fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    📊 Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '12px 28px',
                        border: 'none',
                        borderBottom: activeTab === 'users' ? '3px solid #2ecc71' : '3px solid transparent',
                        background: 'none',
                        color: activeTab === 'users' ? '#2ecc71' : (isDarkMode ? '#aaa' : '#666'),
                        fontWeight: activeTab === 'users' ? 'bold' : 'normal',
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    👥 Registered Users ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    style={{
                        padding: '12px 28px',
                        border: 'none',
                        borderBottom: activeTab === 'orders' ? '3px solid #2ecc71' : '3px solid transparent',
                        background: 'none',
                        color: activeTab === 'orders' ? '#2ecc71' : (isDarkMode ? '#aaa' : '#666'),
                        fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    📦 Orders ({orders.length})
                </button>
                <button
                    onClick={() => setActiveTab('whatsapp')}
                    style={{
                        padding: '12px 28px',
                        border: 'none',
                        borderBottom: activeTab === 'whatsapp' ? '3px solid #2ecc71' : '3px solid transparent',
                        background: 'none',
                        color: activeTab === 'whatsapp' ? '#2ecc71' : (isDarkMode ? '#aaa' : '#666'),
                        fontWeight: activeTab === 'whatsapp' ? 'bold' : 'normal',
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    💬 WhatsApp
                </button>
                <button
                    onClick={() => setActiveTab('newsletter')}
                    style={{
                        padding: '12px 28px',
                        border: 'none',
                        borderBottom: activeTab === 'newsletter' ? '3px solid #2ecc71' : '3px solid transparent',
                        background: 'none',
                        color: activeTab === 'newsletter' ? '#2ecc71' : (isDarkMode ? '#aaa' : '#666'),
                        fontWeight: activeTab === 'newsletter' ? 'bold' : 'normal',
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    📬 Newsletter
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    <div className="stats-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        <div className="stat-card" style={{ border: '2px solid rgba(46, 204, 113, 0.3)', borderRadius: '12px', padding: '25px', textAlign: 'center' }}>
                            <div className="stat-number" style={{ fontSize: '36px', fontWeight: 'bold', color: '#2ecc71' }}>{data.totalUsers}</div>
                            <div style={{ color: isDarkMode ? '#aaa' : '#1e4f2b', marginTop: '5px' }}>Total Users</div>
                        </div>
                        <div className="stat-card" style={{ border: '2px solid rgba(46, 204, 113, 0.3)', borderRadius: '12px', padding: '25px', textAlign: 'center' }}>
                            <div className="stat-number" style={{ fontSize: '36px', fontWeight: 'bold', color: '#2ecc71' }}>{data.activeSubscriptions}</div>
                            <div style={{ color: isDarkMode ? '#aaa' : '#1e4f2b', marginTop: '5px' }}>Active Subscriptions</div>
                        </div>
                        <div className="stat-card" style={{ border: '2px solid rgba(46, 204, 113, 0.3)', borderRadius: '12px', padding: '25px', textAlign: 'center' }}>
                            <div className="stat-number" style={{ fontSize: '36px', fontWeight: 'bold', color: '#2ecc71' }}>{data.revenue}</div>
                            <div style={{ color: isDarkMode ? '#aaa' : '#1e4f2b', marginTop: '5px' }}>Revenue</div>
                        </div>
                    </div>

                    <div className="about-section mt-4">
                        <h2 style={{ color: '#1e9e3e', marginBottom: '15px' }}>Recent Orders</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
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
                </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="about-section">
                    <h2 style={{ color: '#1e9e3e', marginBottom: '20px' }}>Registered Users</h2>

                    {users.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: isDarkMode ? '#aaa' : '#666'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👤</div>
                            <p style={{ fontSize: '16px' }}>No registered users yet.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '14px'
                            }}>
                                <thead>
                                    <tr style={{
                                        borderBottom: '2px solid rgba(46, 204, 113, 0.3)',
                                        textAlign: 'left'
                                    }}>
                                        <th style={{ padding: '12px 15px', color: '#2ecc71', fontWeight: '600' }}>#</th>
                                        <th style={{ padding: '12px 15px', color: '#2ecc71', fontWeight: '600' }}>Name</th>
                                        <th style={{ padding: '12px 15px', color: '#2ecc71', fontWeight: '600' }}>Email</th>
                                        <th style={{ padding: '12px 15px', color: '#2ecc71', fontWeight: '600' }}>Phone</th>
                                        <th style={{ padding: '12px 15px', color: '#2ecc71', fontWeight: '600' }}>Registered On</th>
                                        <th style={{ padding: '12px 15px', color: '#2ecc71', fontWeight: '600' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(46, 204, 113, 0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '12px 15px', color: isDarkMode ? '#aaa' : '#666' }}>{index + 1}</td>
                                            <td style={{ padding: '12px 15px', color: isDarkMode ? '#e0e0e0' : '#1e4f2b', fontWeight: '500' }}>{user.name}</td>
                                            <td style={{ padding: '12px 15px', color: isDarkMode ? '#d0d0d0' : '#333' }}>{user.email}</td>
                                            <td style={{ padding: '12px 15px', color: isDarkMode ? '#d0d0d0' : '#333' }}>{user.phone || '—'}</td>
                                            <td style={{ padding: '12px 15px', color: isDarkMode ? '#aaa' : '#666', fontSize: '13px' }}>{formatDate(user.created_at)}</td>
                                            <td style={{ padding: '12px 15px' }}>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    style={{
                                                        background: '#e74c3c',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '5px 10px',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="about-section">
                    <h2 style={{ color: '#1e9e3e', marginBottom: '20px' }}>Platform Orders</h2>

                    {orders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: isDarkMode ? '#aaa' : '#666'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                            <p style={{ fontSize: '16px' }}>No orders have been placed yet.</p>
                        </div>
                    ) : (
                        <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {orders.map((order, index) => (
                                <div key={index} style={{
                                    border: '1px solid rgba(46, 204, 113, 0.2)',
                                    borderRadius: '10px',
                                    padding: '20px',
                                    background: isDarkMode ? 'rgba(0,0,0,0.2)' : '#fcfcfc'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(46, 204, 113, 0.2)', paddingBottom: '15px', marginBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', color: isDarkMode ? '#e0e0e0' : '#1e4f2b' }}>Order #{order.id}</h3>
                                            <p style={{ margin: '0', fontSize: '14px', color: isDarkMode ? '#aaa' : '#666' }}>{formatDate(order.created_at)}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2ecc71', marginBottom: '5px' }}>₹{order.total_amount}</div>
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                    border: '1px solid #ccc',
                                                    background: order.status === 'DONE' ? '#d4edda' : '#fff3cd',
                                                    color: order.status === 'DONE' ? '#155724' : '#856404',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="PROCESSING">PROCESSING</option>
                                                <option value="DONE">DONE</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ fontSize: '14px', color: isDarkMode ? '#ccc' : '#444' }}>
                                            <strong>Customer:</strong> {order.user_name} ({order.user_email}) {order.phone && `• ${order.phone}`}
                                        </div>
                                        <div style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f9f4', padding: '10px', borderRadius: '5px' }}>
                                            <strong>Items:</strong>
                                            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', fontSize: '14px', color: isDarkMode ? '#ccc' : '#444' }}>
                                                {order.items && order.items.map((item, i) => (
                                                    <li key={i}>{item.quantity}x {item.product_title} - {item.product_price}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Newsletter Tab */}
            {activeTab === 'newsletter' && (
                <div className="about-section">
                    <h2 style={{ color: '#1e9e3e', marginBottom: '20px' }}>Newsletter Broadcast</h2>
                    <p style={{ color: isDarkMode ? '#aaa' : '#666', marginBottom: '20px' }}>
                        Send an email broadcast to all newsletter subscribers.
                    </p>
                    
                    <form onSubmit={handleBroadcast} style={{ 
                        background: isDarkMode ? 'rgba(0,0,0,0.2)' : '#fcfcfc',
                        padding: '20px',
                        borderRadius: '10px',
                        border: '1px solid rgba(46, 204, 113, 0.2)'
                    }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: isDarkMode ? '#ddd' : '#333' }}>Subject</label>
                            <input 
                                type="text" 
                                name="subject" 
                                required 
                                placeholder="Email subject"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    background: isDarkMode ? '#333' : '#fff',
                                    color: isDarkMode ? '#fff' : '#333'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: isDarkMode ? '#ddd' : '#333' }}>Message (HTML supported)</label>
                            <textarea 
                                name="message" 
                                required 
                                rows="8"
                                placeholder="Write your newsletter content here..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    background: isDarkMode ? '#333' : '#fff',
                                    color: isDarkMode ? '#fff' : '#333',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <button type="submit" className="btn" style={{ width: '100%' }}>
                            Send Broadcast
                        </button>
                    </form>
                </div>
            )}

            {/* WhatsApp Tab */}
            {activeTab === 'whatsapp' && (
                <div className="about-section" style={{ display: 'flex', gap: '20px', height: '600px', padding: '0', background: isDarkMode ? '#1a1a1a' : '#fff', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '300px', borderRight: '1px solid rgba(46, 204, 113, 0.2)', overflowY: 'auto' }}>
                        <div style={{ padding: '20px', background: isDarkMode ? '#222' : '#f8f9fa', borderBottom: '1px solid rgba(46, 204, 113, 0.2)' }}>
                            <h3 style={{ margin: 0, color: '#2ecc71' }}>Conversations</h3>
                        </div>
                        {Object.keys(conversations).map(phone => (
                            <div 
                                key={phone} 
                                onClick={() => setSelectedPhone(phone)}
                                style={{ 
                                    padding: '15px 20px', 
                                    cursor: 'pointer', 
                                    borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
                                    background: selectedPhone === phone ? (isDarkMode ? '#333' : '#eafaf1') : 'transparent',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', color: isDarkMode ? '#fff' : '#333' }}>
                                    {conversations[phone][0]?.customer_name || 'Customer'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#888' }}>{phone}</div>
                            </div>
                        ))}
                        {Object.keys(conversations).length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                No conversations yet
                            </div>
                        )}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: isDarkMode ? '#111' : '#fcfcfc' }}>
                        {selectedPhone ? (
                            <>
                                <div style={{ padding: '20px', background: isDarkMode ? '#222' : '#f8f9fa', borderBottom: '1px solid rgba(46, 204, 113, 0.2)' }}>
                                    <h3 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333' }}>{selectedPhone}</h3>
                                </div>
                                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {conversations[selectedPhone].map((msg, i) => {
                                        const isOutbound = !msg.is_incoming;
                                        return (
                                            <div key={i} style={{
                                                alignSelf: isOutbound ? 'flex-end' : 'flex-start',
                                                background: isOutbound ? '#2ecc71' : (isDarkMode ? '#333' : '#e0e0e0'),
                                                color: isOutbound ? '#fff' : (isDarkMode ? '#fff' : '#333'),
                                                padding: '10px 15px',
                                                borderRadius: '15px',
                                                borderBottomRightRadius: isOutbound ? '0' : '15px',
                                                borderBottomLeftRadius: isOutbound ? '15px' : '0',
                                                maxWidth: '70%'
                                            }}>
                                                <div>{msg.last_message}</div>
                                                <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '5px', textAlign: 'right' }}>
                                                    {formatDate(msg.created_at)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ padding: '20px', background: isDarkMode ? '#222' : '#f8f9fa', borderTop: '1px solid rgba(46, 204, 113, 0.2)' }}>
                                    <form onSubmit={handleSendWhatsApp} style={{ display: 'flex', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            name="message" 
                                            placeholder="Type a message..." 
                                            required 
                                            style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ccc', background: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#333' }}
                                        />
                                        <button type="submit" className="btn" style={{ borderRadius: '20px', padding: '10px 25px' }}>
                                            Send
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                Select a conversation to start chatting
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;

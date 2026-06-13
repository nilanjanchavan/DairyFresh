import React, { useState, useEffect } from 'react'
import Popup from './Popup.jsx'
import { AuthService } from '../services/AuthService.js'

function OrderHistoryPopup(props) {
    var isOpen = props.isOpen
    var onClose = props.onClose

    var [orders, setOrders] = useState([])
    var [loading, setLoading] = useState(true)
    var [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            AuthService.getOrderHistory()
                .then(data => {
                    setOrders(data)
                    setLoading(false)
                })
                .catch(err => {
                    setError('Failed to fetch order history')
                    setLoading(false)
                })
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="📦 Order History" size="large">
            <div className="order-history-container" style={{ padding: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>
                ) : error ? (
                    <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛒</div>
                        <h3>No orders yet</h3>
                        <p>You haven't placed any orders.</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order, index) => (
                            <div key={index} style={{ 
                                border: '1px solid #eee', 
                                borderRadius: '8px', 
                                padding: '15px', 
                                marginBottom: '15px',
                                backgroundColor: '#f9f9f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                                    <strong>Order #{order.id}</strong>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: order.status === 'DONE' ? '#d4edda' : '#fff3cd',
                                        color: order.status === 'DONE' ? '#155724' : '#856404'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                                <div>
                                    {order.items && order.items.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', fontSize: '14px' }}>
                                            <span>{item.quantity}x {item.product_title}</span>
                                            <span>{item.product_price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '10px', fontWeight: 'bold' }}>
                                    <span>Total:</span>
                                    <span>₹{order.total_amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Popup>
    )
}

export default OrderHistoryPopup

import React from 'react'
import { useState } from 'react'
import Popup from './Popup.jsx'

function Sidebar(props) {
    var showToast = props.showToast

    var popupState = useState({ isOpen: false, category: '' })
    var popup = popupState[0]
    var setPopup = popupState[1]

    var items = [
        { name: '🥛 Daily Milk', products: ['Full Cream Milk - ₹45/L', 'Toned Milk - ₹42/L', 'Skimmed Milk - ₹40/L'] },
        { name: '🧈 Butter & Cream', products: ['Premium Butter - ₹80/200g', 'Fresh Cream - ₹70/250ml', 'Whipped Cream - ₹90/200ml'] },
        { name: '🧀 Cheese & Paneer', products: ['Fresh Paneer - ₹90/250g', 'Mozzarella - ₹180/250g', 'Cheddar - ₹150/250g'] },
        { name: '🥄 Yogurt & Curd', products: ['Greek Yogurt - ₹60/500g', 'Flavored Yogurt - ₹40/200g', 'Fresh Curd - ₹35/500g'] },
        { name: '📦 Combo Packs', products: ['Breakfast Pack - ₹199', 'Family Pack - ₹399', 'Healthy Start - ₹149'] },
        { name: '⭐ Premium Range', products: ['A2 Milk - ₹85/L', 'Buffalo Milk - ₹65/L', 'Imported Cheese - ₹299/200g'] },
        { name: '🌱 Organic Products', products: ['Organic Milk - ₹75/L', 'Organic Butter - ₹120/200g', 'Organic Ghee - ₹450/500ml'] },
        { name: '🎁 Gift Boxes', products: ['Cheese Hamper - ₹999', 'Dairy Delight - ₹749', 'Premium Box - ₹1299'] }
    ]

    function handleItemClick(item) {
        setPopup({ isOpen: true, category: item.name, products: item.products })
    }

    function handlePopupClose() {
        setPopup({ isOpen: false, category: '', products: [] })
    }

    function handleAddProduct(productName) {
        if (showToast) {
            showToast('Added: ' + productName, 'success')
        }
        handlePopupClose()
    }

    return (
        <aside className="sidebar">
            <h3>Subscriptions</h3>
            {items.map(function (item, index) {
                return (
                    <div
                        key={index}
                        className="sidebar-item"
                        onClick={function () { handleItemClick(item) }}
                    >
                        {item.name}
                    </div>
                )
            })}

            <Popup isOpen={popup.isOpen} onClose={handlePopupClose} title={popup.category}>
                <div className="category-products">
                    <p style={{ marginBottom: '15px', color: '#2ecc71' }}>Select a product to add:</p>
                    {popup.products && popup.products.map(function (product, index) {
                        return (
                            <div
                                key={index}
                                className="category-product-item"
                                onClick={function () { handleAddProduct(product) }}
                                style={{
                                    padding: '12px 15px',
                                    marginBottom: '10px',
                                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>{product}</span>
                                <span style={{ fontSize: '18px' }}>+</span>
                            </div>
                        )
                    })}
                </div>
            </Popup>
        </aside>
    )
}

export default Sidebar

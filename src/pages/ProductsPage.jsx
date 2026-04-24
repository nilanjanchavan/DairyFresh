import React from 'react'
import { useState } from 'react'
import SubscriptionPopup from '../components/SubscriptionPopup.jsx'
import ProductQuickView from '../components/ProductQuickView.jsx'

function ProductsPage(props) {
    var isDarkMode = props.isDarkMode
    var onAddToCart = props.onAddToCart
    var showToast = props.showToast

    var subscriptionState = useState({ isOpen: false, productName: '' })
    var subscription = subscriptionState[0]
    var setSubscription = subscriptionState[1]

    var quickViewState = useState({ isOpen: false, product: null })
    var quickView = quickViewState[0]
    var setQuickView = quickViewState[1]

    var filterState = useState('all')
    var activeFilter = filterState[0]
    var setActiveFilter = filterState[1]

    var categories = [
        {
            id: 'milk',
            title: '🥛 Milk & Cream Collection',
            imageSrc: '/images/fresh-milk.jpg',
            imageDarkSrc: '/images/fresh-milk_dark.jpg',
            items: [
                { name: 'Full Cream Milk', price: '₹45/liter', description: 'Rich and creamy full-fat milk' },
                { name: 'Toned Milk', price: '₹42/liter', description: 'Low-fat milk for health-conscious' },
                { name: 'Double Toned Milk', price: '₹40/liter', description: 'Extra light milk option' },
                { name: 'Fresh Cream', price: '₹70/250ml', description: 'Perfect for cooking and desserts' }
            ],
            buttonText: 'Subscribe to Milk Delivery'
        },
        {
            id: 'organic',
            title: '🌱 Organic Premium Range',
            imageSrc: '/images/organic-products.jpg',
            imageDarkSrc: '/images/organic-products_dark.jpg',
            items: [
                { name: 'Organic Milk', price: '₹65/liter', description: 'Certified organic from grass-fed cows' },
                { name: 'Organic Yogurt', price: '₹80/500g', description: 'Probiotic-rich organic yogurt' },
                { name: 'Organic Butter', price: '₹120/200g', description: 'Pure organic butter' },
                { name: 'Organic Cheese', price: '₹200/250g', description: 'Artisan organic cheese' }
            ],
            buttonText: 'Explore Organic Range'
        },
        {
            id: 'cheese',
            title: '🧀 Artisan Cheese & More',
            imageSrc: '/images/farm-fresh.jpg',
            imageDarkSrc: '/images/farm-fresh_dark.jpg',
            items: [
                { name: 'Cheddar Cheese', price: '₹150/250g', description: 'Aged cheddar with sharp flavor' },
                { name: 'Mozzarella', price: '₹180/250g', description: 'Fresh and stretchy mozzarella' },
                { name: 'Fresh Paneer', price: '₹90/250g', description: 'Soft homemade-style paneer' },
                { name: 'Greek Yogurt', price: '₹60/500g', description: 'Creamy protein-packed yogurt' }
            ],
            buttonText: 'Order Now'
        }
    ]

    var filters = [
        { id: 'all', name: 'All Products' },
        { id: 'milk', name: 'Milk & Cream' },
        { id: 'organic', name: 'Organic' },
        { id: 'cheese', name: 'Cheese & Paneer' }
    ]

    function handleSubscribeClick(categoryTitle) {
        setSubscription({ isOpen: true, productName: categoryTitle })
    }

    function handleSubscriptionClose() {
        setSubscription({ isOpen: false, productName: '' })
    }

    function handleSubscriptionConfirm(data) {
        if (showToast) {
            showToast('Subscribed to ' + data.product + '!', 'success')
        }
    }

    function handleProductClick(item, categoryImage, categoryImageDark) {
        var product = {
            title: item.name,
            description: item.description,
            price: item.price,
            imageSrc: categoryImage,
            imageDarkSrc: categoryImageDark
        }
        setQuickView({ isOpen: true, product: product })
    }

    function handleQuickViewClose() {
        setQuickView({ isOpen: false, product: null })
    }

    function handleFilterClick(filterId) {
        setActiveFilter(filterId)
    }

    var filteredCategories = categories
    if (activeFilter !== 'all') {
        filteredCategories = categories.filter(function (category) {
            return category.id === activeFilter
        })
    }

    return (
        <div className="main-content">
            <div className="content-header">
                <h1>Our Premium Product Range</h1>
                <p>Fresh, pure, and delivered daily to your doorstep</p>
            </div>

            <div className="filter-section" style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {filters.map(function (filter, index) {
                    var buttonStyle = {
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        fontWeight: '600',
                        backgroundColor: activeFilter === filter.id ? 'rgba(46, 204, 113, 0.9)' : 'rgba(46, 204, 113, 0.2)',
                        color: activeFilter === filter.id ? 'white' : '#228b22'
                    }
                    return (
                        <button
                            key={index}
                            style={buttonStyle}
                            onClick={function () { handleFilterClick(filter.id) }}
                        >
                            {filter.name}
                        </button>
                    )
                })}
            </div>

            {filteredCategories.map(function (category, index) {
                var currentImage = isDarkMode ? category.imageDarkSrc : category.imageSrc
                return (
                    <div key={index} className="shared-note" style={{ transition: 'all 0.3s' }}>
                        <div className="image-placeholder">
                            <img
                                src={currentImage}
                                alt={category.title}
                                className="product-img"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
                            />
                        </div>
                        <h3>{category.title}</h3>
                        <div className="card-content">
                            {category.items.map(function (item, itemIndex) {
                                return (
                                    <div
                                        key={itemIndex}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px',
                                            marginBottom: '8px',
                                            backgroundColor: 'rgba(46, 204, 113, 0.05)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                        onClick={function () { handleProductClick(item, category.imageSrc, category.imageDarkSrc) }}
                                    >
                                        <div>
                                            <p style={{ margin: 0 }}><strong>{item.name}</strong> - {item.price}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.8 }}>{item.description}</p>
                                        </div>
                                        <span style={{ fontSize: '20px' }}>→</span>
                                    </div>
                                )
                            })}
                        </div>
                        <button className="btn" onClick={function () { handleSubscribeClick(category.title) }}>
                            {category.buttonText}
                        </button>
                    </div>
                )
            })}

            <SubscriptionPopup
                isOpen={subscription.isOpen}
                onClose={handleSubscriptionClose}
                productName={subscription.productName}
                onSubscribe={handleSubscriptionConfirm}
            />

            <ProductQuickView
                isOpen={quickView.isOpen}
                onClose={handleQuickViewClose}
                product={quickView.product}
                isDarkMode={isDarkMode}
                onAddToCart={onAddToCart}
            />
        </div>
    )
}

export default ProductsPage

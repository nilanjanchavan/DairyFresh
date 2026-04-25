import React from 'react'
import { useState } from 'react'
import Popup from './Popup.jsx'
import ShareButton from './ShareButton.jsx'

function ProductQuickView(props) {
    var isOpen = props.isOpen
    var onClose = props.onClose
    var product = props.product
    var isDarkMode = props.isDarkMode
    var onAddToCart = props.onAddToCart

    var quantityState = useState(1)
    var quantity = quantityState[0]
    var setQuantity = quantityState[1]

    if (product === null || product === undefined) {
        return null
    }

    var currentImage = isDarkMode ? product.imageDarkSrc : product.imageSrc

    function handleDecrease() {
        if (quantity > 1) {
            setQuantity(quantity - 1)
        }
    }

    function handleIncrease() {
        if (quantity < 10) {
            setQuantity(quantity + 1)
        }
    }

    function handleAddToCart() {
        onAddToCart(product, quantity)
        setQuantity(1)
        onClose()
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={product.title} size="large">
            <div className="quick-view-container">
                <div className="quick-view-image">
                    <img
                        src={currentImage}
                        alt={product.title}
                        style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '15px' }}
                    />
                </div>
                <div className="quick-view-details">
                    <p className="quick-view-description">{product.description}</p>
                    <p className="quick-view-price">{product.price}</p>

                    <div className="quantity-selector">
                        <span className="quantity-label">Quantity:</span>
                        <div className="quantity-controls">
                            <button className="quantity-btn" onClick={handleDecrease}>−</button>
                            <span className="quantity-value">{quantity}</span>
                            <button className="quantity-btn" onClick={handleIncrease}>+</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="btn add-to-cart-btn" onClick={handleAddToCart} style={{ flex: 1 }}>
                            🛒 Add to Cart
                        </button>
                        <ShareButton 
                            title={`Buy ${product.title} from DairyFresh`}
                            text={`I found this premium ${product.title} at DairyFresh. It's ${product.price}.`}
                        />
                    </div>
                </div>
            </div>
        </Popup>
    )
}

export default ProductQuickView

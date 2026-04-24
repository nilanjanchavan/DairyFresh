-- DairyFresh Database Initialization
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(100) NOT NULL,
    product_title VARCHAR(200) NOT NULL,
    product_price VARCHAR(50) NOT NULL,
    product_image VARCHAR(200),
    product_image_dark VARCHAR(200),
    product_description VARCHAR(500),
    quantity INT NOT NULL DEFAULT 1,
    UNIQUE KEY unique_user_product (user_email, product_title),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

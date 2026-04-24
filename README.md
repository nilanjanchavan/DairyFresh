# 🥛 [DairyFresh]

A responsive React frontend showcasing a variety of premium dairy products. This project highlights product details, nutritional information, and provides an engaging, interactive user interface for browsing dairy items like milk, cheese, butter, and yogurt.

## ✨ Features
* **Dynamic Product Catalog:** Reusable React components displaying various dairy products.
* **Responsive Design:** Fully accessible and optimized for both desktop and mobile viewing.
* **Interactive UI:** Smooth state transitions, hover effects, and fast client-side routing.

## 🛠️ Tech Stack
* **Frontend:** React, CSS / Tailwind CSS, Vite
* **Backend:** Java 21, Tomcat 10, Jakarta Servlets
* **Database:** MySQL
* **Deployment:** Nginx, Docker

## 🚀 Getting Started
Live instance at [Netlify](https://dairy-fresh.netlify.app/).<br>
To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DistantMyth/DairyFresh.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd DairyFresh
   ```

3. **Frontend Setup (Vite / React):**
   ```bash
   npm install
   npm run dev 
   ```
   Open `http://localhost:5173` to view the frontend.

4. **Backend Setup (Java + Maven):**
   Ensure you have Java 21 and Maven installed.
   ```bash
   cd backend
   mvn clean package
   ```
   Deploy the generated `target/backend.war` to a local Tomcat 10 server.

## ☁️ AWS & Docker Deployment
The project is fully ready for deployment on AWS EC2 (or any VPS).
We use `docker-compose` to spin up Nginx, Tomcat, and MySQL together.

1. Build the frontend and backend:
   ```bash
   npm run build
   cd backend && mvn clean package && cd ..
   ```
2. Copy `.env.example` to `.env` and set your credentials.
3. Start the services:
   ```bash
   docker-compose up -d
   ```
The app will be accessible on port 80.

## 🤝 Contributors

Thanks to the following people who have contributed to this project:

* **Tarun Kumar** - *Lead Developer* - [@DistantMyth](https://github.com/DistantMyth)
* **[Saksham Singhal]** - *Webpage Structuring* - [@saksham3100](https://github.com/saksham3100)
* **[Nilanjan Chavan]** - *dynamic elements* - [@nilanjanchavan](https://github.com/nilanjanchavan)

## 📝 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

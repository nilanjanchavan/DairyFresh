# 🌿 DairyFresh

A responsive React frontend showcasing a variety of premium dairy products, now powered by a robust Java backend. This project highlights product details, nutritional information, and provides an engaging, interactive user interface for browsing dairy items like milk, cheese, butter, and yogurt—all styled in a fresh Green & White theme!

## ✨ Features
* **Dynamic Product Catalog:** Reusable React components displaying various dairy products.
* **Responsive Design:** Fully accessible and optimized for both desktop and mobile viewing.
* **Interactive UI:** Smooth state transitions, hover effects, and fast client-side routing.
* **API Backend:** A lightweight Java Servlet backend providing endpoints (e.g., `/api/ping`).
* **Docker Ready:** Effortlessly deployable to AWS or any VPS via a unified Docker Compose setup.

## 🛠️ Tech Stack
* **Frontend:** React, Tailwind CSS, Vite
* **Backend:** Java 21, Jakarta Servlets, Tomcat 10
* **Database:** MySQL 8
* **Deployment & Infrastructure:** Docker, Docker Compose, Nginx

---

## 🚀 Local Development Guide

To run this project locally without Docker, follow these steps to spin up the frontend and backend independently.

### 📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:
* **Node.js** (v18+ recommended) & **npm**
* **Java Development Kit (JDK) 21**
* **Apache Maven**
* **MySQL 8** (Running locally on port 3306)

### 1. Database Setup
1. Open your local MySQL instance.
2. Create the database: `CREATE DATABASE dairyfresh_db;`
3. Ensure your local MySQL user/password matches what is defined in the environment variables, or update your local `.env` configuration.

### 2. Frontend Setup (React / Vite)
The frontend runs via Vite and serves the main UI interface.
```bash
# Clone the repository
git clone https://github.com/DistantMyth/DairyFresh.git
cd DairyFresh

# Install Javascript dependencies
npm install

# Start the Vite development server
npm run dev
```
Navigate to `http://localhost:5173` to view the frontend interface.

### 3. Backend Setup (Java / Maven)
The backend is a standard Maven web application running on Tomcat 10.
```bash
# Open a new terminal and navigate to the backend folder
cd DairyFresh/backend

# Use Maven to clean the target and package the project into a .war file
mvn clean package
```
This produces a `backend.war` file in the `backend/target/` directory. 
- Deploy this `backend.war` to your local Tomcat 10 `webapps/` folder.
- Start Tomcat. 
- You can verify the API is running by hitting: `http://localhost:8080/backend/api/ping`

---

## ☁️ Production / AWS Deployment (Docker)

The project is fully pre-configured for containerized deployment, perfect for pulling into an AWS EC2 instance, ECS, or any standard Linux VPS. 

The provided `docker-compose.yml` spins up:
1. **Nginx:** Acting as a reverse proxy (serving the React static build on `/` and proxying `/api/` traffic to Tomcat).
2. **Tomcat 10:** Running the Java 21 backend.
3. **MySQL 8:** Serving the `dairyfresh_db`.

### Step-by-Step Deployment Guide
1. **Clone the Repo on your Server**:
   ```bash
   git clone https://github.com/DistantMyth/DairyFresh.git
   cd DairyFresh
   ```

2. **Configure Environment Variables**:
   We use a `.env` file to securely inject database credentials into both the Java backend and the MySQL container.
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Edit the `.env` file to set your actual production database passwords.*

3. **Build the Artifacts**:
   Before building the Docker containers, you must build the React static files and the Java `.war` file locally on the server (or CI pipeline).
   ```bash
   # Build Frontend
   npm install
   npm run build

   # Build Backend
   cd backend
   mvn clean package
   cd ..
   ```

4. **Start the Containers**:
   To launch the entire stack in detached mode:
   ```bash
   docker-compose up -d
   ```

5. **Verify the Deployment**:
   * View the application at `http://YOUR_SERVER_IP`
   * Check the logs if necessary: `docker-compose logs -f`

---

## 🤝 Contributors
Thanks to the following people who have contributed to this project:
* **Tarun Kumar** - *Lead Developer* - [@DistantMyth](https://github.com/DistantMyth)
* **[Saksham Singhal]** - *Webpage Structuring* - [@saksham3100](https://github.com/saksham3100)
* **[Nilanjan Chavan]** - *dynamic elements* - [@nilanjanchavan](https://github.com/nilanjanchavan)

## 📝 License
This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

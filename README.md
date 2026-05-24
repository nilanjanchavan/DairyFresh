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
* **Backend:** Java 21, Spring Boot 3
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

### 3. Backend Setup (Java / Maven / Spring Boot)
The backend is a Spring Boot application.
```bash
# Open a new terminal and navigate to the backend folder
cd DairyFresh/backend

# Use Maven to run the Spring Boot application locally
mvn spring-boot:run
```
This will automatically start an embedded Tomcat server.
- You can verify the API is running by hitting: `http://localhost:8080/api/ping`

---

## ☁️ Production / AWS Deployment (Step-by-Step EC2 Guide)

The project is fully pre-configured for containerized deployment using Docker Compose. Here is a detailed guide to deploying this stack on an AWS EC2 instance.

### Phase 1: AWS EC2 Provisioning
1. **Launch an EC2 Instance:**
   * Go to the AWS EC2 Console and click "Launch Instance".
   * Select **Ubuntu Server 24.04 LTS** (or 22.04 LTS).
   * Choose an instance type (e.g., `t3.micro` for testing, `t3.small` for production).
   * Select or create a Key Pair for SSH access.
2. **Configure Security Groups (Firewall):**
   * Edit the inbound rules of the instance's security group to allow the following traffic:
     * **SSH (Port 22):** Your IP
     * **HTTP (Port 80):** Anywhere (0.0.0.0/0)
     * **HTTPS (Port 443):** Anywhere (0.0.0.0/0)

### Phase 2: Server Setup (Install Docker)
1. **Connect to your instance via SSH:**
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```
2. **Install Docker and Docker Compose:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-v2
   sudo usermod -aG docker $USER
   # Log out and log back in for docker group changes to take effect
   ```

### Phase 3: Application Configuration
1. **Clone the Repo on your Server**:
   ```bash
   git clone https://github.com/DistantMyth/DairyFresh.git
   cd DairyFresh
   ```

2. **Configure Environment Variables & Credentials**:
   We use a `.env` file to securely inject database, Twilio, and Firebase credentials into the stack.
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Edit the `.env` file to set your actual production database passwords, Firebase VAPID key, Twilio SID/Auth Token, etc.*

3. **Add Firebase Service Account**:
   If you are using Push Notifications, securely create the `firebase-service-account.json` in the root of the project:
   ```bash
   nano firebase-service-account.json
   ```
   *Paste your Firebase Admin SDK JSON content here and save.*

### Phase 4: Build & Deploy
1. **Build the Artifacts**:
   Before building the Docker containers, you must build the React static files and the Java `.war` file locally on the server (Requires Node.js and Maven). Alternatively, build them locally and use `scp` to copy the `dist` and `target` folders to the server.
   
   If compiling on the server:
   ```bash
   # Install tools
   sudo apt install nodejs npm maven openjdk-21-jdk -y
   
   # Build Frontend
   npm install
   npm run build

   # Build Backend
   cd backend
   mvn clean package -DskipTests
   # This creates target/backend-1.0-SNAPSHOT.jar
   cd ..
   ```

2. **Start the Containers**:
   Launch the entire stack (Nginx, Tomcat, MySQL) in detached mode:
   ```bash
   sudo docker compose up --build -d
   ```

3. **Verify the Deployment**:
   * Visit `http://YOUR_EC2_PUBLIC_IP` in your browser.
   * View live logs to ensure backend/database health: `sudo docker compose logs -f`

---

## 🤝 Contributors
Thanks to the following people who have contributed to this project:
* **Tarun Kumar** - *Lead Developer* - [@DistantMyth](https://github.com/DistantMyth)
* **[Saksham Singhal]** - *Webpage Structuring* - [@saksham3100](https://github.com/saksham3100)
* **[Nilanjan Chavan]** - *dynamic elements* - [@nilanjanchavan](https://github.com/nilanjanchavan)
* **[Aradhya Verma]** - *UI/UX Designer* - [@aradhyaverma2911-cyber](https://github.com/aradhyaverma2911-cyber)

## 📝 License
This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

# SmartHealthCare System 🏥 — AI Clinical Console & Transactional Ledger

SmartHealthCare is a state-of-the-art, enterprise-grade digital healthcare console and medical records management portal. It integrates an intelligent symptom triage chatbot fallback engine, secure role-based dashboard metrics, a highly-robust ACID-compliant **Payment Transaction Ledger** mapping simulated checkouts, and independent containerized container orchestration using Docker.

Designed with modern full-stack architecture standards, this project is optimized for production scalability, high performance, and robust security, making it a stellar showcase for advanced product engineering standards.

---

## 🚀 Key Architectural Capabilities

### 1. ACID-Compliant Transaction Ledger
- Mapped a secure `@OneToOne` relation between `Appointment` and `Payment` database schemas.
- Implemented Spring Framework's `@Transactional` boundary tags on the backend payments endpoint (`/api/payments/process`), securing transaction states. If a ledger commit fails, any related appointment status updates are automatically rolled back, guaranteeing absolute data consistency.
- Automatically generates secure, non-collision Transaction IDs (e.g. `TXN_SHC_XXXXXXXX`) and injects them dynamically onto printed PDF receipts.

### 2. Live Dynamic UPI QR Code Checkout
- Features an interactive payment gateway wizard supporting UPI QR Code scanning and card inputs.
- Automatically constructs a scan-ready live UPI payment URL matching the doctor's name and exact consultation fee:
  `upi://pay?pa=smarthealthcare@okaxis&pn=SmartHealthCare&am={FEES}&cu=INR`
- Generates a **real-time UPI QR Code image** in the React DOM. Scanning this QR code using GPay, PhonePe, or Paytm instantly opens the payment interface with pre-filled amounts on your smartphone!

### 3. Complete Mobile Responsiveness
- Implemented global viewport bounds (`overflow-x: hidden`) restricting layouts from shifting or shaking horizontally.
- Refactored the navigation bar to support a collapsible hamburger menu (☰ / ✕) on small screens, which expands into an interactive dropdown drawer with premium vertical clinical card layouts.

### 4. Interactive Timelines & Searchable Records History
- Upgraded the Doctor Dashboard with an interactive **"Medical Records History"** tabbed console.
- Features a real-time patient name search query filter and automated PDF export buttons, enabling doctors to search through written records history dynamically.

### 5. Multi-Stage Docker Containerization
- Built with a professional, **two-stage build Dockerfile** compilation pattern to ensure highly secure, lightweight production image wrappers.
- Orchestrates Spring Boot and MySQL databases under isolated overlay networks seamlessly using `docker-compose`.

---

## 🛠️ Technology Stack

- **Backend:** Spring Boot (Java 17/22), Spring Data JPA, Spring Security (JWT Tokens), Lombok, Swagger UI (Springdoc OpenAPI)
- **Frontend:** React (JSX), Tailwind CSS, Axios Client, PDF Generation utilities (jsPDF)
- **Database & Cache:** MySQL 8.0, Redis In-Memory caching (configured)
- **DevOps:** Docker, Docker Compose, Git version control versioning

---

## 🐋 How to Deploy and Run (Local Containerized Environment)

### Prerequisites
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your local machine.

### Step 1: Boot Up Backend and Database (Docker Compose)
Open your terminal (PowerShell, Command Prompt, or Git Bash), navigate to the **`Backend/`** folder of the project, and execute the orchestrator command:
```bash
docker-compose up --build
```
* **What happens:** Docker compiles the Spring Boot source files, downloads the MySQL 8.0 environment, links them securely, exposes the Backend at `http://localhost:8081` and the database at port `3306` mapped locally.
* **Verify Health:** Open `http://localhost:8081/actuator/health` in your browser. It should return `{"status":"UP"}` indicating healthy micro-services boot.

### Step 2: Boot Up Frontend (React Local Dev)
Open a new terminal window, navigate to the **`frontend/`** folder, and run:
```bash
# Install dependencies
npm install

# Start development server
npm start
```
* **Verify Client:** React will automatically launch at `http://localhost:3000` and link with the containerized Spring Boot backend services running at port `8081` instantly.

---

## 🔍 REST API Documentation (OpenAPI Swagger UI)
Once the backend container is running, developers can browse, inspect, and test all REST endpoints (authentication, appointments booking, payments ledger, clinical records) dynamically by navigating to:
```url
http://localhost:8081/swagger-ui/index.html
```


## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Register Page
![Register](screenshots/register.png)

### Login Page
![Login](screenshots/login.png)

### Reset Password
![Reset Password](screenshots/reset_password.png)

### Welcome Page
![Welcome Page](screenshots/patient_welcome_page.png)

### Chat Bot
![AI Assistant](screenshots/ai_assistant.png)

### Book Appointment
![Book Appointment](screenshots/book_appointment_page.png)


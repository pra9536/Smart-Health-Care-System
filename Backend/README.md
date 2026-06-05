# SmartHealthCare Backend Console 🏥 — Spring Boot Microservice API

Welcome to the backend microservice repository for **SmartHealthCare**. This is an enterprise-grade RESTful API built on **Spring Boot 3**, Java 17/22, and MySQL. It orchestrates clinical medical records, appointment schedules, security policies, and financial checkouts.

---

## 🚀 Architectural Design & Core Capabilities

### 1. Robust Role-Based Access Control (RBAC)
- Utilizes **Spring Security** combined with **JSON Web Tokens (JWT)** to manage session lifecycles.
- Restricts endpoints based on user roles (`PATIENT`, `DOCTOR`, `ADMIN`).
- Implemented CORS policies allowing cross-origin handshakes securely with React environments.

### 2. Transactional Financial Checkout (ACID)
- Exposes a secure payments processing engine at `/api/payments/process`.
- Structured with Spring's `@Transactional` boundary controls. If database persistence fails at any point during billing or appointment updates, the entire state automatically rolls back, guaranteeing absolute data consistency.

### 3. Fail-Safe OTP & SMTP Email Engine
- Integrated **JavaMailSender** supporting dynamic HTML templates for appointment notifications and login verifications.
- **Fail-Safe Mechanism:** In local development environments lacking active SMTP configurations (using defaults), the backend intercepts connection failures gracefully. Instead of throwing exceptions, it generates a secure 6-digit verification code, logs the **raw OTP key** and password reset links to the system terminal, and returns a `200 OK` response to the client. This allows for a completely uninterrupted developer workflow!

### 4. Database Schema Auto-Creation & Audit Logs
- Configured with Hibernate ORM (`spring.jpa.hibernate.ddl-auto=update`) to automatically synchronize entities with local MySQL schemas on startup.
- Automatically maintains an `audit_logs` ledger tracking user actions, performed duties, IP addresses, and exact server timestamps to guarantee enterprise corporate compliance.

---

## 📁 Repository Architecture

```bash
Backend/
├── src/
│   ├── main/
│   │   ├── java/com/smarthealthcare/
│   │   │   ├── config/      ← Security configuration, CORS policies, and Redis Cache setups
│   │   │   ├── controller/  ← AuthController, PaymentController, AppointmentController, etc.
│   │   │   ├── dto/         ← LoginRequest, RegisterRequest, AppointmentRequest payloads
│   │   │   ├── entity/      ← Relational schemas (User, Patient, Doctor, Appointment, Payment, etc.)
│   │   │   ├── repository/  ← JPA database query persistence mappings
│   │   │   ├── security/    ← JWT filters, user details loading, and token utils
│   │   │   └── service/     ← OtpService, EmailService, ChatbotService business logic
│   │   └── resources/
│   │       ├── application.properties ← Database ports, JWT configuration, and env fallbacks
│   │       └── db/          ← (Optional) Migration schemas
│   └── test/                ← Complete JUnit & Mockito controllers and services test suites
├── Dockerfile               ← Multi-stage compilation build file
└── pom.xml                  ← Maven dependency suite manifest
```

---

## ⚙️ Setup & Local Native Run

### Prerequisites
- Make sure you have **Java 17** or **Java 22** installed and configured on your host system.
- Make sure you have a local **MySQL server** running and listening on port `3306`.

### Step 1: Prepare Database
Log into your MySQL terminal and establish a blank schema:
```sql
CREATE DATABASE smarthealthcare_db;
```

### Step 2: Configure Environment Placeholders
The application uses secure defaults. If you have custom SMTP accounts, you can export them as system environment variables:
- `SMTP_USERNAME` / `SMTP_PASSWORD`
- `ANTHROPIC_API_KEY` (For AI Assistant)

### Step 3: Run the Application Natively
Navigate to the `Backend/` directory and execute:
```powershell
# Set Java Home to your local JDK and run Spring Boot
$env:JAVA_HOME="C:\Path\To\Your\jdk"
mvn spring-boot:run
```
* **Verify Boot:** The application will compile local classes, verify dependencies, synchronize schemas, and launch the Tomcat container on port **`8081`**.
* **Observe Logs:** If you register a new patient, look at this terminal window—the raw **OTP key** will print in a large block for immediate registration verification!

---

## 📖 API Documentation & Live Test Console
Once started, you can browse, test, and run mock API calls directly from your browser by visiting the OpenAPI Swagger console:
```url
http://localhost:8081/swagger-ui/index.html
```
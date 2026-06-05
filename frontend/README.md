# SmartHealthCare Client Console 🏥 — React SPA & UI Console

Welcome to the frontend workspace for **SmartHealthCare**. This is a premium Single Page Application (SPA) built using React, React Router, Tailwind CSS, and Axios. 

The user interface has been designed from the ground up to support high-end clinical styling, fluid interactions, absolute viewport stability, and full mobile-first responsiveness.

---

## 🎨 Design System & Aesthetics
- **harmonies HSL Color Palette:** Tailored deep indigo primaries (`indigo-600`), soft hospital blues (`blue-500`), and warm warning/success states that look professional and clinical.
- **Glassmorphism & Shadows:** Interactive dashboard tiles feature gentle backdrops and scale lifts on hover to engage users.
- **Modern Typography:** Imported clean web fonts and configured balanced spacing metrics (replacing flat default dimensions with highly symmetrical custom styles).
- **Absolute Viewport Locking:** Integrated global layout wrappers (`overflow-x-hidden`) to completely eliminate left-to-right page shaking on smaller devices.

---

## 🚀 Key Client Capabilities

### 1. Collapsible Hamburger Navigation Bar (Mobile First)
- **Responsive Navigation:** On desktop screens, links are rendered in a sleek horizontal row with smooth active highlights. On screen widths below `768px`, the navbar seamlessly collapses into a mobile hamburger toggle button (☰ / ✕) that slides open a premium clinical dropdown menu with custom-padded icons.

### 2. Multi-Step Payments & UPI QR Checkout
- **Checkout Wizard:** Integrated a beautiful booking checkout wizard inside `BookAppointment.jsx`.
- **UPI QR Code Generator:** Uses a lightweight public API to construct a completely valid UPI scan string. Scanning the dynamic QR code image using a smartphone immediately launches your preferred UPI payment app (GPay, PhonePe, Paytm) with the doctor's name and consulting fees pre-filled!
- **Receipt Ledger Log:** Post-payment, the console logs the transaction ID securely and prints it dynamically on downloadable PDF invoices.

### 3. Asynchronous PDF Invoice Generation
- **Clinical Receipts:** Built using `jsPDF` and `html2canvas` inside `generatePDF.js`. Generates professional, branded invoices featuring patient names, symptoms, doctor details, and dynamic Transaction IDs.

### 4. Searchable Doctor & Medical History Consoles
- **Doctor Dashboards:** Upgraded with a custom "Medical Records History" console featuring a real-time, patient-name search input and immediate PDF export hooks.
- **Patient Dashboards:** Corrected completed receipt button hover colors for flawless accessibility.

---

## 📁 Key File Structure

```bash
frontend/
├── public/                 ← Static icons, base manifest, and index.html
└── src/
    ├── api/
    │   └── axiosInstance.js ← Axios interceptors attaching JWT headers and redirecting on 401
    ├── components/
    │   ├── Navbar.jsx      ← Collapsible responsive navbar with Hamburger Toggle
    │   └── ProtectedRoute.jsx ← Higher-Order Component restricting unauthorized page access
    ├── context/
    │   └── AuthContext.jsx ← Manages user login states, JWT tokens, and global session storage
    ├── pages/
    │   ├── BookAppointment.jsx ← Dynamic appointment booking & multi-step payment gateway
    │   ├── Chatbot.jsx     ← AI symptom diagnostic console with header exit (✕) button
    │   ├── DoctorDashboard.jsx ← Doctor panel with tabbed searchable records list
    │   ├── PatientDashboard.jsx ← Patient panel with active status tiles and invoice downloads
    │   ├── Login.jsx       ← Auth entry portal with redirect handlers
    │   └── Register.jsx    ← Role selector and OTP verification wizard
    ├── utils/
    │   └── generatePDF.js  ← Utility to compile and export clinical reports
    ├── App.js              ← Viewport container, React Router configuration, and route priorities
    └── index.css           ← Base Tailwind setup and global viewport resets
```

---

## ⚙️ How to Setup & Run

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Step 1: Install Dependencies
Open your terminal inside the `frontend/` directory and execute:
```bash
npm install
```

### Step 2: Start local Development Server
```bash
npm start
```
* **Verify Client:** The development server compiles files in real time and automatically launches the app at **`http://localhost:3000`**.
* **Api Connection:** The client automatically bridges calls to the Spring Boot API hosted at `http://localhost:8081/api` via the custom Axios instance.

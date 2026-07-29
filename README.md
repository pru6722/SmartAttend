# 🎓 SmartAttend ERP

> Enterprise-grade Smart Attendance, Academic Management & Institution ERP Platform

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io)

---

## 📖 Overview

**SmartAttend ERP** is a modern enterprise-level attendance and academic management platform designed for universities and educational institutions.

The system combines **multi-layer attendance verification**, **real-time classroom sessions**, **dynamic QR authentication**, **device verification**, **biometric security**, **academic grading**, **timetable management**, and **institution-wide administration** into a single ERP solution.

Unlike traditional attendance systems, SmartAttend uses a **7-Step Security Verification Engine** to minimize proxy attendance and unauthorized access.

---

# ✨ Features

## 🎯 Student Portal

- Secure Login & JWT Authentication
- Live QR Code Attendance
- Dynamic 6-Digit Session Code Entry
- Camera QR Scanner
- QR Image/Screenshot Upload
- Attendance History
- Dynamic Grade Cards
- CGPA Calculator
- Student Helpdesk
- Profile Management

---

## 👨‍🏫 Teacher Portal

- Create Live Attendance Sessions
- Dynamic QR Code Generation
- Rolling OTP Attendance Codes
- Live Student Attendance Monitoring
- Real-Time Socket.IO Updates
- Publish Student Marks
- Multiple Evaluation Types
- Attendance Analytics
- Classroom Projector Mode

---

## 🏢 Admin Portal

- Department Management
- Student Management
- Teacher Management
- Course Management
- Section-wide Timetable Allocation
- Helpdesk Ticket Resolution
- Attendance Reports
- Academic Monitoring
- System Administration

---

# 🔐 7-Step Attendance Verification Engine

Every attendance request passes through multiple security layers before being stored in MongoDB.

### ✅ Step 1 — Authentication

- JWT Validation
- User Authorization
- Student Profile Verification

---

### ✅ Step 2 — Enrollment Verification

Confirms that the student belongs to

- Department
- Year
- Section

for the active class session.

---

### ✅ Step 3 — Active Session Validation

Checks

- Active Class
- Subject
- Faculty
- Current Timetable

---

### ✅ Step 4 — Dynamic Attendance Code

Every live session generates a unique rolling

- 6-digit OTP

which must match the teacher's current session.

---

### ✅ Step 5 — Time Window Validation

Attendance is accepted only within the

**2-minute attendance window**

After expiration the session closes automatically.

---

### ✅ Step 6 — Network Verification

Verifies that the student is connected to the same campus network by checking

- X-Forwarded-For
- Reverse Proxy Headers
- CIDR Matching (/24 Subnet)

Supported Networks

- 192.168.x.x
- 10.x.x.x
- 172.x.x.x

---

### ✅ Step 7 — Device Fingerprint & Biometric Verification

First Login

- Device fingerprint is securely registered.

Different Device Login

- Device mismatch detected.
- Facial Liveness Verification required.
- Eye Blink Detection.
- Camera Verification.

Only after successful verification is attendance recorded.

---

# 🏗️ System Architecture

```
Student
    │
    ▼
QR Scan / OTP
    │
    ▼
Attendance API
    │
    ▼
Authentication
    │
    ▼
Enrollment Check
    │
    ▼
Timetable Validation
    │
    ▼
Session Validation
    │
    ▼
OTP Verification
    │
    ▼
Time Window Check
    │
    ▼
Network Verification
    │
    ▼
Device Verification
    │
    ▼
Facial Liveness (if required)
    │
    ▼
MongoDB
```

---

# 📷 QR Attendance System

## Teacher

- Live Session Creation
- Large Classroom QR Code
- Projector Mode
- Rolling OTP
- Real-Time Attendance Broadcast

## Student

- Rear Camera Scanner
- Front Camera Fallback
- Screenshot QR Upload
- Offline JavaScript QR Decoder
- Automatic Session Detection

---

# 📊 Academic Management

### Teacher Features

- Internal Marks
- Mid-Term Marks
- End Semester Marks
- Subject-wise Publishing

### Student Features

- Grade Report
- Letter Grades
- SGPA
- CGPA
- Semester Performance

---

# 📅 Timetable Management

Admin can allocate

- Department
- Year
- Section

for the entire university timetable.

Supports

- Weekly Schedule
- Standard University Time Slots
- Section-wide Timetable Generation

---

# 💬 Helpdesk System

Students and Teachers can

- Attendance Requests
- Name Corrections
- Profile Updates
- Academic Queries

Administrators can

- Review Tickets
- Add Responses
- Resolve Requests
- Track Pending Tickets

---

# ⚡ Real-Time Communication

Implemented using **Socket.IO**

Features include

- Live Attendance Updates
- Session Status
- Student Presence
- Instant Notifications

---

# 🛡️ Security Features

- JWT Authentication
- Password Encryption
- Device Fingerprinting
- Facial Liveness Verification
- QR Validation
- Dynamic OTP
- Session Expiration
- Campus Network Verification
- Helmet Security Headers
- CORS Protection
- Rate Limiting
- Trust Proxy Support
- MongoDB Validation

---

# 💻 Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO Client

---

## Backend

- Node.js
- Express.js
- TypeScript
- Socket.IO
- JWT Authentication
- Helmet
- Express Rate Limiter

---

## Database

- MongoDB Atlas
- Mongoose

---

## Security

- JWT
- Device Fingerprinting
- Facial Liveness Verification
- QR Authentication
- CIDR Network Matching

---

# 📂 Project Structure

```
SmartAttend ERP
│
├── smartattend-client
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── utils
│   └── assets
│
├── smartattend-server
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── models
│   ├── services
│   ├── utils
│   └── config
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/SmartAttend-ERP.git
```

---

## Backend

```bash
cd smartattend-server

npm install

npm run dev
```

---

## Frontend

```bash
cd smartattend-client

npm install

npm run dev
```

---

# 🌐 Deployment

Frontend

- Vercel

Backend

- Render

Database

- MongoDB Atlas

---

# 🔮 Future Improvements

- NFC Attendance
- BLE Beacon Verification
- AI Face Recognition
- Push Notifications
- Mobile Application
- Parent Portal
- Analytics Dashboard
- Multi-Campus Support
- Attendance Prediction using AI

---

# 👨‍💻 Author

**Prudhvi Sai Lingineni**

B.Tech Computer Science & Engineering (Big Data Analytics)

SRM University AP

📧 Email: prudhvisailingineni@example.com

🔗 LinkedIn: https://linkedin.com/in/prudhvi-sai-lingineni-707349289

🌐 GitHub: https://github.com/pru6722

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to contribute!

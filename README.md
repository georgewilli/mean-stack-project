# MEAN Stack Contact Manager

A full-stack application built with **MongoDB**, **Express.js**, **Angular**, and **Node.js** to manage contact numbers with real-time editing lock, authentication, and role-based access control.

---

## 🚀 Features

- 🔐 JWT Authentication with hardcoded users
- 📇 Add, edit, delete, and filter contacts
- 🧮 Server-side pagination with MongoDB
- 🔎 Column-based filtering: Name, Phone, Address
- ✏️ In-grid editing using PrimeNG
- 🚫 Real-time editing lock using Socket.io
- 👥 Role-based access control (RBAC)
- ✅ Form validation (client + server side)
- 📦 Clean code structure, ready for Docker deployment

---

## 🧪 Login Credentials

| Username | Password | Role  |
|----------|----------|-------|
| user1    | user1    | admin |
| user2    | user2    | user  |

---

## 🛠️ Tech Stack

- **Frontend**: Angular + PrimeNG + TailwindCSS + Angular Material
- **Backend**: Node.js + Express.js + Mongoose + Socket.io
- **Database**: MongoDB
- **Auth**: JWT
- **Real-time**: WebSockets (Socket.io)

---

## 📦 How to Run (Locally)

### Prerequisites:
- Node.js
- Angular CLI
- MongoDB (local or cloud)
- Docker (for containerized deployment)

---

### 🔧 Backend (Express)

```bash
cd backend
npm install
npm run seed:users
npm run dev
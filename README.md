
---

# 🔷 SkillSync — Team Formation & Collaboration Platform
A full-stack collaborative platform that enables **smart hackathon team formation** based on skills, roles, and real-time interaction.

## 🎯 Problem Statement
Hackathon participants struggle to find compatible teammates efficiently.
SkillSync solves this by enabling:
- Skill-based team matching
- Role-controlled collaboration
- Real-time communication within teams

---

## 🛠️ Tech Stack
- MongoDB
- Express.js
- React.js
- Node.js
- Socket.io
- JWT Authentication

---

## 🔐 Key Features
- 👥 **Role-Based Access Control (RBAC)**
  - Admin / Member / Applicant roles
- 🔑 **Stateless Authentication**
  - JWT-based authentication for scalability
- 💬 **Real-Time Communication**
  - Private Socket.io chat within teams
- 📊 **Dynamic Dashboards**
  - UI adapts based on user role
- 🧑‍🤝‍🧑 **Team Screening**
  - Room owners can approve or reject applicants

---

## 🏗️ Architecture Overview
React Frontend
->
REST APIs (Express.js)
->
JWT Auth + RBAC Middleware
->
MongoDB
->
Socket.io (Real-Time Layer)


---

## ▶️ How to Run Locally
```bash
git clone https://github.com/mithi-2005/SkillSync.git
cd backend
npm install
nodemon server.js
cd ..
cd frontend
npm run dev
```

🔒 Security & Design Decisions

- Stateless JWT authentication to support horizontal scaling

- RBAC enforced via Express middleware

- Socket events scoped per room for privacy

🌐 Live Demo

👉 https://innovhack25.web.app

🚀 Future Enhancements

- Recommendation engine for team matching

- Notifications system

- Analytics dashboard

- Deployment with Docker

👨‍💻 Author

  Team SkillSync

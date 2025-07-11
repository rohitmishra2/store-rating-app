# 🛍️ Store Rating App

A full-stack web application where users can rate stores, and admins can manage users and stores with role-based access.

## 🔧 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Vite  
- **Backend**: Express.js, PostgreSQL  
- **Auth**: JWT-based authentication (role-based)

---

## ✅ Features

### 👑 Admin
- Login with admin credentials
- Dashboard with total users, stores, and ratings
- Add users (Admin, Store Owner, Normal User)
- Add stores with store owner assignment
- View and filter user list (by name, email, address, role)
- View and filter store list (with avg rating)

### 👤 Normal User
- Register & login
- View all stores with:
  - Name, address, average rating
  - Your own submitted rating
- Search stores by name/address
- Submit or update ratings (1 to 5)

### 🧑‍💼 Store Owner *(backend ready)*
- Login
- (Frontend pending) View users who rated their store and avg rating

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/store-rating-app.git
cd store-rating-app

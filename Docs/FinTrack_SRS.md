# 🧾 Software Requirements Specification (SRS)
## Project Title: FinTrack – Personal Finance Management System
**Version:** 1.0  
**Date:** October 2025  
**Author:** Satwik Mohanty  

---

## 📘 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **FinTrack**, a personal finance tracking web application.  
The purpose of FinTrack is to allow users to manage their **income, expenses, budgets, and savings**, while visualizing financial data through intuitive charts and dashboards.

### 1.2 Scope
FinTrack helps individuals track and analyze their financial activities, providing:
- Transaction tracking (income and expense)
- Budget planning and utilization monitoring
- Financial dashboards with charts and summaries
- Authentication and role-based access
- Responsive and modern UI/UX

The system will include both a **backend API** (Node.js + Express + MongoDB) and a **frontend client** (React + Tailwind + Chart.js).

---

## 🧩 2. Overall Description

### 2.1 Product Perspective
FinTrack is an independent full-stack web application.  
It uses RESTful APIs for data exchange between the frontend and backend.  

#### System Architecture
```
Frontend (React + Tailwind) → REST API (Express.js) → MongoDB (Database)
```

### 2.2 Product Functions
1. **User Management**
   - User Registration & Login (JWT Authentication)
   - Secure storage of user credentials
2. **Transactions**
   - Add, edit, delete transactions (income or expenses)
   - Categorization of transactions (food, travel, bills, etc.)
3. **Budgets**
   - Create and manage category-based budgets
   - Automatically track utilization from transactions
   - Display remaining or overspent budget
4. **Dashboard**
   - Show financial summary (income, expenses, savings)
   - Show visual analytics via charts (bar, doughnut, line)
5. **Reports**
   - Monthly and yearly spending analysis
   - Export or view categorized breakdowns
6. **UI Features**
   - Responsive layout for all devices
   - Sidebar navigation and light/modern design

---

## ⚙️ 3. System Features

### 3.1 User Authentication
| Feature | Description |
|----------|--------------|
| Input | Email, Password |
| Process | Verifies credentials and issues JWT |
| Output | Access token for authorized requests |
| Exception | Invalid credentials return 401 error |

---

### 3.2 Transaction Management
| Feature | Description |
|----------|--------------|
| Add Transaction | User can add income or expense |
| Edit/Delete | Modify or remove a transaction |
| Auto Categorization | Group by category (e.g., food, travel) |
| Validation | Amount must be numeric, category non-empty |

---

### 3.3 Budget Management
| Feature | Description |
|----------|--------------|
| Create Budget | Define limit for a category |
| Track Utilization | Automatically calculate spent & remaining |
| Alerts | Visual indicators (green, yellow, red) based on usage |
| CRUD | Add, update, delete budgets |

---

### 3.4 Dashboard & Analytics
| Feature | Description |
|----------|--------------|
| Overview | Show total income, expenses, savings |
| Charts | Bar (7-day trends), Doughnut (income vs expense), Line (30-day balance) |
| Category Insights | Breakdown of top spending categories |
| Dynamic Updates | Auto-refresh after transaction changes |

---

## 🧠 4. Non-Functional Requirements

| Category | Description |
|-----------|--------------|
| **Performance** | API response time ≤ 1s for CRUD operations |
| **Scalability** | Handles up to 10,000 transactions per user |
| **Security** | JWT authentication, password hashing with bcrypt |
| **Usability** | Clean UI, intuitive navigation, color-coded data |
| **Portability** | Works on all modern browsers and devices |
| **Reliability** | Database consistency and error handling with Mongoose |
| **Maintainability** | Modular code with reusable components |

---

## 🗂️ 5. System Design

### 5.1 Data Flow Diagram (DFD – Level 1)
```
          +-----------------+
          |     User        |
          +-----------------+
                 | Input
                 v
         +----------------------+
         |  Frontend (React)    |
         +----------------------+
                 | REST API Calls
                 v
         +----------------------+
         | Backend (Express.js) |
         +----------------------+
                 | CRUD Ops
                 v
         +----------------------+
         |   MongoDB Database   |
         +----------------------+
```

### 5.2 Entity Relationship (ER) Diagram
```
User ---< Transaction >--- Category
  |
  └──< Budget >--- Category
```

---

## 🧾 6. Database Design

### Collections:

#### Users
```json
{
  "name": "string",
  "email": "string",
  "password": "hashed_string",
  "createdAt": "date"
}
```

#### Transactions
```json
{
  "userId": "ObjectId",
  "type": "income | expense",
  "category": "string",
  "amount": "number",
  "date": "date",
  "paymentMethod": "string",
  "notes": "string"
}
```

#### Budgets
```json
{
  "userId": "ObjectId",
  "category": "string",
  "limit": "number",
  "spent": "number",
  "remaining": "number",
  "month": "number",
  "year": "number"
}
```

---

## 🧮 7. Functional Flow Example

**Add Expense → Track Budget → Update Dashboard**
```
User adds transaction (Expense)
      ↓
Backend saves expense and updates budget (spent)
      ↓
Budget utilization recalculated
      ↓
Dashboard auto-refreshes to show new expense
```

---

## 🧩 8. External Interfaces

| Interface | Description |
|------------|--------------|
| **Frontend** | React, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Visualization** | Chart.js (Line, Bar, Doughnut) |
| **Testing** | Postman for API testing |
| **Deployment** | Render / Vercel / Netlify (optional) |

---

## 🧰 9. Constraints

- Internet connection required for API access.  
- Single user session per device.  
- Limited offline capability (browser cache only).  
- Real-time updates depend on refresh or frontend hooks.

---

## 📈 10. Future Enhancements

- Recurring transactions and bill reminders  
- AI-powered spending insights  
- PDF report export  
- Multi-user and shared budgets  
- Dark mode and customizable dashboard widgets  

---

## ✅ 11. Conclusion

FinTrack provides an **efficient, scalable, and user-friendly** way to manage personal finances.  
Its modular design allows easy maintenance and future feature integration like real-time syncing and analytics extensions.

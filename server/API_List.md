# Server API LIST
  
  ## 🔑 Auth APIs (/api/auth)

  | Method   | Endpoint         | Description                                       |
  | -------- | ---------------- | ------------------------------------------------- |
  | **POST** | `/auth/register` | Register a new user (returns token + sets cookie) |
  | **POST** | `/auth/login`    | Login user (returns token + sets cookie)          |
  | **POST** | `/auth/logout`   | Logout user (clears cookie)                       |

  ## 💰 Transaction APIs (/api/transactions)

  | Method     | Endpoint                | Description                                                        |
  | ---------- | ----------------------- | ------------------------------------------------------------------ |
  | **POST**   | `/transactions`         | Add a new transaction (income/expense)                             |
  | **GET**    | `/transactions`         | Get all transactions for logged-in user                            |
  | **PUT**    | `/transactions/:id`     | Update a transaction by ID                                         |
  | **DELETE** | `/transactions/:id`     | Delete a transaction by ID                                         |
  | **GET**    | `/transactions/summary` | Get income, expense, and savings (monthly/yearly filter supported) |

  ##  📊 Budget APIs (/api/budgets)
  
  | Method     | Endpoint               | Description                                                |
  | ---------- | ---------------------- | ---------------------------------------------------------- |
  | **POST**   | `/budgets`             | Create a new budget for a category (monthly/yearly)        |
  | **GET**    | `/budgets`             | Get all budgets for logged-in user                         |
  | **PUT**    | `/budgets/:id`         | Update budget limit or category                            |
  | **DELETE** | `/budgets/:id`         | Delete a budget by ID                                      |
  | **GET**    | `/budgets/utilization` | Get budget utilization (spent vs. limit for each category) |

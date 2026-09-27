# Assetly

> **A modern personal finance and investment dashboard for tracking, analyzing, and managing multiple asset classes in one place.**

Assetly is a **full-stack personal finance platform** that brings stocks, cryptocurrency, forex, gold, earnings, market news, transactions, and portfolio analytics into a centralized dashboard.

The application is designed to give users a clear view of their financial activity and market performance while providing secure authentication, portfolio management, and automated financial data updates.

---
**DEMO :** https://github.com/sajjalf23/Assetly/blob/main/Assetly-Demo%20(1).mp4

## 👥 Authors & Contributors

* **Sajjal** — [sajjalf23](https://github.com/sajjalf23)
* **Misharab Waheed** — [misharab15](https://github.com/misharab15)

🛠️ 𝗧𝗲𝗰𝗵 𝗦𝘁𝗮𝗰𝗸:

• 𝗙𝗿𝗼𝗻𝘁𝗲𝗻𝗱: React • Vite • React Context API • Axios • React Router

• 𝗕𝗮𝗰𝗸𝗲𝗻𝗱 & 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲: Node.js • Express (REST API) • Supabase (PostgreSQL)

• 𝗔𝘂𝘁𝗵 & 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆: Google OAuth • JWT (HTTP-only cookies) • Rate Limiting • CORS Protection

• 𝗔𝗣𝗜𝘀 & 𝗗𝗮𝘁𝗮 𝗙𝗲𝗲𝗱𝘀: Binance • KuCoin • Coinbase • Ethereum Wallet • Oanda • Finnhub • Paperinvest.io

• 𝗗𝗲𝘃𝗢𝗽𝘀 & 𝗛𝗼𝘀𝘁𝗶𝗻𝗴: Docker • Docker Compose • Vercel

• 𝗨𝘁𝗶𝗹𝗶𝘁𝗶𝗲𝘀: XLSX / Excel / JSON Export

🌐 𝗟𝗶𝘃𝗲 𝗗𝗲𝗺𝗼: https://assetly-taupe.vercel.app/

**ScreenShot of Some of the pages:**

<img width="1440" height="777" alt="Screenshot 2026-09-27 at 11 21 05 PM" src="https://github.com/user-attachments/assets/7e624ec6-d048-4638-b5df-93acc6906054" />
<img width="1439" height="774" alt="Screenshot 2026-09-27 at 11 21 39 PM" src="https://github.com/user-attachments/assets/59d8e695-4390-4211-a4d6-7536eb06465e" />
<img width="1440" height="777" alt="Screenshot 2026-09-27 at 11 23 15 PM" src="https://github.com/user-attachments/assets/3499ab6e-b545-4900-ad04-2805e3b055cc" />
<img width="1417" height="755" alt="Screenshot 2026-09-27 at 11 24 21 PM" src="https://github.com/user-attachments/assets/d492cdaf-1984-4341-a2d1-e52316d2bdea" />
<img width="1414" height="778" alt="Screenshot 2026-09-27 at 11 24 05 PM" src="https://github.com/user-attachments/assets/20dc0236-355b-48b1-a590-0560d791eb54" />
<img width="1440" height="775" alt="Screenshot 2026-09-27 at 11 23 51 PM" src="https://github.com/user-attachments/assets/b4bad4d4-de5b-4608-8120-bcd5206cccb4" />
<img width="1439" height="778" alt="Screenshot 2026-09-27 at 11 23 33 PM" src="https://github.com/user-attachments/assets/f7690d41-c01b-4575-be38-4eba60ee66d4" />
<img width="1438" height="777" alt="Screenshot 2026-09-27 at 11 22 55 PM" src="https://github.com/user-attachments/assets/3ea40a6e-1d32-4f01-a321-aa8ec392dcb0" />
<img width="1440" height="780" alt="Screenshot 2026-09-27 at 11 22 41 PM" src="https://github.com/user-attachments/assets/eb2422b0-c1fa-4e2c-97c1-9a855446bfbd" />


## ✨ Features

### 📊 Financial Dashboard
- Portfolio performance overview
- Asset allocation visualization
- Net worth tracking
- Market summaries
- Real-time/near-real-time market data
- Financial performance analytics

### 📈 Stocks
- Stock price tracking
- Percentage price changes
- Market data and performance visualization
- Earnings information
- Historical performance analysis

### 💱 Forex
- Currency pair prices
- Exchange-rate changes
- Forex market data
- Currency performance tracking

### 🪙 Cryptocurrency
- Cryptocurrency prices
- Price change tracking
- Crypto portfolio data
- Transaction management
- Market visualization

### 🥇 Gold & Market Indicators
- Gold price tracking
- Market snapshots
- Multi-asset market overview

### 📰 Financial News
- Market news
- Stock-related news
- Cryptocurrency news
- Financial headlines

### 💰 Earnings Tracker
- Earnings data and growth visualization
- Historical earnings information
- Earnings-focused analytics

### 💳 Account & Transaction Management
- Add financial accounts
- Track account balances
- Record buy/sell transactions
- Transfer tracking
- Transaction history with filtering

### 📲 Portfolio Analytics
- Portfolio overview
- Asset allocation
- Performance tracking
- Historical portfolio analysis

### 📤 Transaction Export
- Excel/XLSX export
- Transaction history export

### 🔐 Authentication & Security
- User registration and login
- Authentication sessions with access/refresh tokens
- Protected routes
- Password change and reset
- Google OAuth integration
- HTTP-only cookies
- Password hashing
- CORS protection
- HTTP security headers
- API rate limiting

### 📧 Newsletter
- Newsletter subscription
- Email-based communication
- Subscription management

### ⏰ Automated Tasks
- Scheduled monthly portfolio snapshots
- Automated financial data updates
- Background market-data processing
- Cron-based scheduled tasks

---

## 🏗️ Architecture

Assetly follows a client-server architecture:


                    ┌──────────────────────┐
                    │      Assetly UI     │
                    │   React + Vite      │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend   │
                    │      Node.js        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Authentication    Market Data     PortfolioData
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │      Supabase       │
                    │    PostgreSQL DB    │
                    └──────────────────────┘



## Folder Structure


```
Assetly/
│
├── client/                         # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── Api/
│   │   │   └── axios.js            # Axios API configuration
│   │   ├── Context/
│   │   │   ├── appContext.jsx
│   │   │   └── appContextProvider.jsx
│   │   ├── Pages/
│   │   │   ├── Accounts.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   ├── Crypto.jsx
│   │   │   ├── Earnings.jsx
│   │   │   ├── Forex.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── News.jsx
│   │   │   ├── Overview.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── SignUp.jsx
│   │   │   ├── Stocks.jsx
│   │   │   ├── Transactions.jsx
│   │   │   └── authCallback.jsx
│   │   ├── components/
│   │   │   ├── ExportTransactionsModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── hooks/
│   │   │   └── useHomeData.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   ├── data/
│   │   ├── Styles/
│   │   ├── assets/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env
│
├── server/                         # Node.js + Express backend
│   ├── config/
│   ├── controllers/                # Business logic
│   │   ├── accountsController.js
│   │   ├── authController.js
│   │   ├── cryptoController.js
│   │   ├── earningsController.js
│   │   ├── forexController.js
│   │   ├── homeController.js
│   │   ├── landingPageController.js
│   │   ├── newsController.js
│   │   ├── newsletterController.js
│   │   ├── overviewController.js
│   │   ├── stocksController.js
│   │   └── transactionController.js
│   ├── routes/                     # API routes
│   │   ├── accountRouter.js
│   │   ├── authRouter.js
│   │   ├── cryptoRouter.js
│   │   ├── earningsRouter.js
│   │   ├── forexRouter.js
│   │   ├── homeRouter.js
│   │   ├── landingPageRouter.js
│   │   ├── newsRouter.js
│   │   ├── newsletterRouter.js
│   │   ├── overviewRouter.js
│   │   ├── stocksRouter.js
│   │   └── transactionRouter.js
│   ├── middleware/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml
├── .gitignore
└── README.md

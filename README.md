# Payment Gateway Project

Hey! 👋 This is a payment gateway simulation I built to understand how systems like Stripe or Razorpay work under the hood. It handles merchant onboarding, creating orders, and processing payments using UPI and Cards.

It's a full-stack implementation—backend, frontend dashboard, and a checkout page—all containerized with Docker so you can spin it up with a single command.

## What's Inside?

- **Merchant Dashboard**: A place for merchants to log in, see their API keys, and track transaction stats (Volume, Success Rate, etc.).
- **Checkout Page**: A hosted page where the actual "payment" happens. It mimics a real payment flow including processing delays and success/failure screens.
- **The Core API**: Built with Node.js & Express. It handles the heavy lifting:
  - Validating UPI IDs (regex checks).
  - Validating Card numbers (Luhn algorithm!).
  - Auto-detecting card networks (Visa, Mastercard, etc.).
  - Securely handling API keys.

## Quick Start

I've set this up to be super easy to run. You just need **Docker** installed.

1.  **Clone this repo**:

    ```bash
    git clone "https://github.com/Umeshh27/payment-gateway"
    cd payment-gateway
    ```

2.  **Run it**:
    ```bash
    docker-compose up --build
    ```
    Give it a minute. You'll know it's ready when you see `Server running on port 8000` in the logs.

## How to Test It

Here's a quick walkthrough to save you time guessing how things work.

### 1. Log in as a Merchant

Go to [http://localhost:3000](http://localhost:3000).

- **Email**: `test@example.com`
- **Password**: literally anything (it's a test account)
- _The dashboard will show you your API Key and Secret._

### 2. Create an Order

Open your terminal and create an order (replace the keys if you want, but these come pre-seeded):

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -d '{
    "amount": 50000,
    "currency": "INR"
  }'
```

_Note: Amount is in paise (so 50000 = ₹500)._

### 3. Make the Payment

Grab the `id` from the response (it starts with `order_...`).
Open your browser to:
`http://localhost:3001/checkout?order_id=YOUR_ORDER_ID_HERE`

Try paying!

- **UPI**: `anything@upi` works.
- **Card**: Google a "valid test credit card number" (Luhn valid) or just use `4242 4242 4242 4242` until it passes validation.

## 💾 Database Schema

Here is how the data is structured in PostgreSQL.

### Merchants

| Column       | Type    | Description   |
| :----------- | :------ | :------------ |
| `id`         | UUID    | Primary Key   |
| `name`       | VARCHAR | Merchant Name |
| `email`      | VARCHAR | Unique Email  |
| `api_key`    | VARCHAR | Auth Key      |
| `api_secret` | VARCHAR | Auth Secret   |

### Orders

| Column        | Type    | Description         |
| :------------ | :------ | :------------------ |
| `id`          | VARCHAR | `order_` + 16 chars |
| `merchant_id` | UUID    | Foreign Key         |
| `amount`      | INTEGER | Amount in paise     |
| `status`      | VARCHAR | created, paid, etc. |

### Payments

| Column     | Type    | Description                 |
| :--------- | :------ | :-------------------------- |
| `id`       | VARCHAR | `pay_` + 16 chars           |
| `order_id` | VARCHAR | Linked Order                |
| `method`   | VARCHAR | upi / card                  |
| `status`   | VARCHAR | processing, success, failed |

## 🔌 API Reference

| Method | Endpoint               | Description         | Auth |
| :----- | :--------------------- | :------------------ | :--- |
| `GET`  | `/health`              | System health check | No   |
| `POST` | `/api/v1/orders`       | Create a new order  | Yes  |
| `GET`  | `/api/v1/orders/:id`   | Get order details   | Yes  |
| `POST` | `/api/v1/payments`     | Process payment     | Yes  |
| `GET`  | `/api/v1/payments/:id` | Get payment status  | Yes  |

## 📂 Project Structure

```bash
payment-gateway/
├── backend/
│   ├── src/
│   │   ├── config/         # DB Connection
│   │   ├── controllers/    # Route Logic
│   │   ├── middleware/     # Auth Logic
│   │   ├── routes/         # API Definitions
│   │   ├── utils/          # Validation & Helpers
│   │   ├── app.js          # Express App
│   │   └── schema.sql      # Database Setup
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Login, Transactions
│   │   └── App.jsx         # Routing
│   ├── Dockerfile
│   └── index.html
├── checkout-page/
│   ├── src/
│   │   ├── pages/          # Checkout UI
│   │   └── App.jsx
│   ├── Dockerfile
│   └── index.html
├── docker-compose.yml      # Service Orchestration
└── README.md
```

## Tech Stack

- **Backend**: Node.js & Express
- **Database**: Postgres (schema auto-migrates on startup)
- **Frontend**: React + Vite (Custom CSS, no massive libraries)
- **DevOps**: Docker & Docker Compose

# Payment Gateway

A robust, dockerized payment gateway simulation supporting Merchant Onboarding, Order Management, and multi-method payment processing (UPI & Cards). Built with Node.js, React, and PostgreSQL.

## 🚀 Features

-   **Merchant Dashboard**: View transactions, analytics, and manage API credentials.
-   **Hosted Checkout Page**: A secure, professional interface for customers to complete payments.
-   **RESTful API**: Comprehensive endpoints for creating orders and processing payments.
-   **Multi-Method Support**:
    -   **UPI**: Validates VPA formats.
    -   **Credit/Debit Cards**: Luhn algorithm validation, automatic network detection (Visa, Mastercard, RuPay), and secure handling.
-   **Security**: API Key & Secret authentication for all merchant operations.
-   **Simulation**: Realistic processing delays and success/failure scenarios for testing.
-   **Docker Ready**: One-command deployment for the entire stack.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: PostgreSQL
-   **Frontend**: React (Vite) for Dashboard and Checkout
-   **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## 🏁 Getting Started

1.  **Clone the Repository** (if not already done)
    ```bash
    git clone <repository-url>
    cd payment-gateway
    ```

2.  **Environment Configuration**
    A `.env` file has been automatically generated from `.env.example`. You can customize it if needed, but the defaults work out of the box.

3.  **Start the Application**
    Run the following command to build and start all services:
    ```bash
    docker-compose up --build
    ```
    *Wait for the logs to indicate that the server is running on port 8000.*

## 🔌 Architecture

The project creates 4 containers:

| Service | URL | Description |
| :--- | :--- | :--- |
| **API** | `http://localhost:8000` | Core backend logic & database interaction |
| **Postgres** | `localhost:5432` | Relational database persistence |
| **Dashboard** | `http://localhost:3000` | Merchant UI for analytics & logs |
| **Checkout** | `http://localhost:3001` | Customer-facing payment page |

## 🧪 Testing & Usage

### 1. Merchant Login
-   **URL**: [http://localhost:3000/login](http://localhost:3000/login)
-   **Email**: `test@example.com`
-   **Password**: *(Any password)*
-   **Note**: A test merchant is automatically seeded on startup.

### 2. Create an Order (API)
Use the API Key/Secret found in your dashboard to create an order.
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "order_rcpt_1"
  }'
```

### 3. Process Payment (Checkout)
-   Copy the `id` from the API response (e.g., `order_...`).
-   Visit: `http://localhost:3001/checkout?order_id=<YOUR_ORDER_ID>`
-   Complete the payment using UPI (`user@bank`) or Card (`5111...` for Mastercard).

## 📚 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | System health check | No |
| `POST` | `/api/v1/orders` | Create a new payment order | Yes |
| `GET` | `/api/v1/orders/:id` | Fetch order details | Yes |
| `POST` | `/api/v1/payments` | Process a payment (S2S) | Yes |
| `GET` | `/api/v1/payments/:id` | Get payment status | Yes |

## 📂 Project Structure

```
payment-gateway/
├── backend/            # Express.js API
├── frontend/           # React Dashboard
├── checkout-page/      # React Checkout UI
├── docker-compose.yml  # Orchestration
└── README.md           # Documentation
```

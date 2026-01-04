# Merchant Dashboard

This is the frontend dashboard for the Payment Gateway. It allows merchants to log in, view their API credentials, and monitor transaction analytics.

## ⚡ Features

- **Authentication**: Simple login flow for merchants.
- **Analytics**: Real-time overview of total volume, transaction count, and success rates.
- **Transaction History**: Detailed list of all payments with status badges (Success, Processing, Failed).
- **API Access**: Displays the merchant's API Key and Secret for integration.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) (via Vite)
- **Styling**: Custom CSS (No external UI libraries)
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## 💻 Local Development

If you want to run the frontend separately from Docker:

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Start Dev Server**:

    ```bash
    npm run dev
    ```

    The app will run at `http://localhost:5173` (by default).

    _Note: Ensure the backend API is running on port 8000 for data fetching to work._

## 🐳 Docker Deployment

In the main project setup, this dashboard is containerized and served via Nginx on port **3000**.

- **URL**: [http://localhost:3000](http://localhost:3000)

## 🔑 Test Credentials

To log in and see the dashboard in action:

- **Email**: `test@example.com`
- **Password**: _(Any password)_

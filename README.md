# ApheZis Tech Internship Enrollment Portal

A modern, high-tech internship enrollment platform with premium dark/light mode aesthetics, integrated with Notion for database management and Resend for automated email notifications.

## 🚀 Features

-   **Premium UI/UX**: "True Charcoal" (Dark) and "Cloud Dancer" (Light) themes with glassmorphism and smooth animations.
-   **Notion Integration**: Automatically saves enrollment data to a Notion database.
-   **Automated Emails**: Sends instant confirmation emails to both the admin and the candidate.
-   **Responsive Design**: Mobile-first approach for accessibility on all devices.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
-   **Backend**: Node.js, Express.
-   **APIs**: Notion SDK, Resend SDK.

## 🔧 Installation & Setup

1.  **Clone the repository**:
    ```bash
    cd Enternship-enroll
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory (refer to `.env.example`):
    ```env
    NOTION_KEY=your_notion_secret
    NOTION_DATABASE_ID=your_notion_database_id
    RESEND_API_KEY=your_resend_api_key
    ADMIN_EMAIL=admin@aphezis.com
    FROM_EMAIL=onboarding@resend.dev
    PORT=3000
    ```

4.  **Run the application**:
    ```bash
    npm start
    ```
    Visit `http://localhost:3000` in your browser.

## 📝 Notion Database Schema

Ensure your Notion database has the following properties:
-   **Name** (Title)
-   **Email** (Email)
-   **Phone** (Phone)
-   **Interest** (Select)
-   **Resume** (URL)

## 📍 Location

Address: 24P7+C3V, Kigali (ADEPR Nyakabanda)

---
© 2026 ApheZis Tech. All rights reserved.

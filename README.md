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

## 🚀 Deployment (Production)

To deploy to a production server automatically:

1.  **Setup PM2** (Process Manager):
    ```bash
    npm install -g pm2
    ```

2.  **Initialize the deployment script**:
    Make the script executable:
    ```bash
    chmod +x deploy.sh
    ```

3.  **CI/CD with GitHub Actions**:
    - The repository includes a `.github/workflows/deploy.yml`.
    - Set the following **Secrets** in your GitHub repository (`Settings > Secrets and variables > Actions`):
        - `SERVER_HOST`: Your server's IP address.
        - `SERVER_USER`: Your SSH username (e.g., `root` or `ubuntu`).
        - `SERVER_SSH_KEY`: Your private SSH key.

4.  **Manual Deployment**:
    You can also run the script manually on the server:
    ```bash
    ./deploy.sh
    ```

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

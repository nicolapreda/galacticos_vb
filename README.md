<div align="center">
  <img src="public/assets/logo.webp" alt="Galacticos VB Logo" width="200" height="200" style="border-radius: 50%;">

  # ⚽ Galacticos VB

  **Official Website & Management System**
  <br>
  _Calcio a 7 CSI - Bergamo_

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
  [![SQLite](https://img.shields.io/badge/SQLite-Local-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)
  [![MySQL](https://img.shields.io/badge/MySQL-Prod-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

  [🌐 Visit Website](https://galacticosvb.it) • [🐛 Report Bug](https://github.com/nicolapreda/galacticos_vb/issues)

</div>

---

## 🚀 About The Project

**Galacticos VB** is the official web platform for a **7-a-side football team** competing in the CSI League in Bergamo.

Built with **Next.js 15** and **React Server Components**, it delivers high performance and SEO optimization. The design is bold, responsive, and mobile-first, utilizing **Tailwind CSS** for rapid styling.

### ✨ Key Features

-   **📊 Match Center**: Real-time scores, standings, and automated scraping of league data (CSI Bergamo).
-   **🛒 Official Shop**: E-commerce functionality with **Stripe** integration and WhatsApp checkout options.
-   **📸 Smart Gallery**: Automatically syncs match photos from Google Drive using Puppeteer automation.
-   **⚡ Admin Panel**: Secure dashboard to manage news, products, orders, and match comments.
-   **🎨 Dynamic UI**: Custom themes, animations, and responsive layouts.

---

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons.
-   **Backend**: Node.js Server Actions, API Routes.
-   **Database**: SQLite (Development) / MySQL (Production via Docker).
-   **Automation**: Puppeteer (Scraping & Gallery Sync), Cron Jobs.
-   **Payment**: Stripe API.
-   **DevOps**: Docker, Docker Compose.

---

## 🏁 Getting Started

### Prerequisites

-   **Node.js** (v18+)
-   **npm** or **yarn**
-   **Docker** (optional, recommended for production)

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/nicolapreda/galacticos_vb.git
    cd galacticos_vb
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env.local` file based on `.env.example` (if available) or add the following keys:
    ```env
    # Database
    MYSQL_HOST=localhost
    MYSQL_USER=root
    MYSQL_PASSWORD=...
    MYSQL_DATABASE=galacticos_db

    # Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...

    # Gallery Sync
    GALLERY_FOLDER_ID=...
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 🐳 Docker Deployment

To run the full stack in production mode with Docker:

```bash
# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f
```

---

## 🤖 Scripts & Automation

The project includes several utility scripts in the `scripts/` folder:

| Script | Description |
| :--- | :--- |
| `npm run sync-gallery` | Scrapes Google Drive folder and updates `gallery.json`. |
| `node scripts/update_schema_v2.js` | Updates database schema (adds columns safely). |
| `node scripts/download-logos.js` | Downloads team logos for the standings table. |

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ by Nicola Preda & Team</p>
</div>

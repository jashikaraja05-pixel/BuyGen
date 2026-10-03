# BUYGEN — Consumer Electronics Marketplace

> **"Next-Gen Shopping, Smarter Choices."**  
> *Production-style e-commerce platform built for INFYHACKATHON 2.0.*

BUYGEN is a full-stack, enterprise-grade e-commerce application engineered for the **Consumer Electronics** niche. It features a complete customer storefront, a secure role-protected admin console, an interactive AI Tech Advisor powered by Google Gemini, live product discovery with multi-faceted filtering, atomic stock management, and simulated payment gateways (UPI, Credit/Debit Card, and Cash on Delivery).

---

## 🌟 Key Highlights & Problem Statement Compliance

- **No Mock or Pure Frontend Fallbacks:** Every customer and admin action (registration, cart management, checkout, status progression, stock updates) interacts with a real Node.js/Express backend and persistent database.
- **Dual Application Experiences:**
  1. **Customer Web Store:** Complete responsive shopping experience across desktop, tablet, and mobile.
  2. **Admin Management Panel:** Strictly role-guarded (`role: "admin"`) administration portal for catalog, orders, categories, and registered users.
- **BUYGEN Smart Tech Advisor:** AI electronic consultant that extracts budget, specifications, and use cases, querying the real database to recommend matching products without hallucinating specs or prices.
- **Atomic Stock Validation:** Prevents over-ordering, negative quantities, or invalid stock states upon every checkout.
- **Simulated Payment Gateway:** Implements sandbox simulation for UPI, Cards, and COD without processing real financial transactions.

---

## 💻 Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, ES Modules.
- **Database:** Google Cloud Firestore (provisioned via Firebase) with in-memory caching and persistent synchronized storage.
- **Authentication & Security:** JWT / Tokenized Sessions, BCrypt password hashing (`bcryptjs`), Role-Based Access Control (RBAC), SQL/NoSQL injection prevention, sanitized payload validation.
- **AI Engine:** Google Gemini API (`@google/genai`, model `gemini-3.8-flash`) with fallback semantic rule matching.

---

## 📱 Application Routes & Experiences

### Customer Web Store
| Route | Description |
|---|---|
| `/` | Polished homepage with Hero showcase, category cards, AI Advisor teaser, featured, trending, new arrivals, and deals. |
| `/products` | Complete catalog discovery with live search, brand, category, subcategory, price range, and rating filters. |
| `/products/:id` | Product detail page with gallery thumbnails, technical specifications table, reviews, stock status, and quantity selector. |
| `/categories/:category` | Specialized category view with subcategory pill selectors. |
| `/search` | Natural language smart search results with AI parameter extraction. |
| `/cart` | Real-time persisted shopping cart with stock limits and live subtotal/discounts. |
| `/checkout` | 3-step simulated checkout (Shipping Address, Order Summary, Payment Simulation: UPI / Card / COD). |
| `/order-success/:id` | Order confirmation screen with celebratory confetti, tracking timeline, and itemized invoice. |
| `/orders` | Customer order history with live status badges. |
| `/orders/:id` | Order details page with step-by-step progress tracking (*Pending → Confirmed → Processing → Shipped → Delivered*). |
| `/wishlist` | Saved electronics with one-click "Move to Cart". |
| `/compare` | Side-by-side comparison of up to 3 electronics with AI technical evaluation. |
| `/advisor` | BUYGEN Smart Tech Advisor requirement analyzer and recommendation engine. |
| `/profile` | Account profile with metrics, shipping destinations, and role badges. |
| `/login` | Secure login with 1-click Demo Fill buttons. |
| `/register` | Secure customer registration with client & server validation. |

### Protected Admin Console (`/admin`)
*Strictly guarded by server-side authorization check (`role === "admin"`). Unauthorized users are blocked with a 403 Forbidden screen.*

| Admin Tab | Description |
|---|---|
| **Dashboard** | Real database metrics: Total Products, Total Users, Total Orders, Total Revenue, Low Stock Alerts, and Recent Orders. |
| **Products** | Add product modal with specifications builder, edit pricing & discounts, inline stock updating, and safe deletion. |
| **Categories** | Create, edit, and delete categories and subcategories (with safeguards preventing orphaned products). |
| **Orders** | Search orders, view addresses, and update status (*Pending → Confirmed → Processing → Shipped → Delivered*). |
| **Users** | View registered users, roles, order counts, and registration dates (passwords never exposed). |

---

## 🔒 Security & Data Integrity

1. **Password Hashing:** Passwords are never stored in plain text; all credentials are encrypted using `bcryptjs` with salt rounds.
2. **Server-Side Authorization:** Admin endpoints (`/api/products`, `/api/orders/:id/status`, `/api/admin/*`) strictly verify administrator identity.
3. **Stock Guarding:** Atomic stock checks ensure orders are rejected if a customer attempts to purchase more units than available in the warehouse.
4. **Anti-Duplicate Submissions:** Checkout and review submission buttons include loading locks and state barriers to eliminate duplicate transactions.

---

## 🔑 Demo & Test Accounts

You can sign in immediately using the one-click demo buttons on the **Login Page (`/login`)**:

| Account Type | Email | Password | Role |
|---|---|---|---|
| **Customer Demo** | `customer@buygen.com` | `Customer@123` | Customer |
| **Admin Demo** | `admin@buygen.com` | `Admin@123` | Administrator |
| **Evaluation Admin** | `jashikahack@gmail.com` | `Admin@123` | Administrator |

---

## 🛠️ Setup & Local Execution

### 1. Prerequisites
- Node.js (v18+)
- npm or bun

### 2. Environment Variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000` with the Vite dev server and Express API router.

### 5. Build & Run Production Full-Stack Server
```bash
npm run build
npm start
```

---

## 🏆 INFYHACKATHON 2.0 Team
- **Product:** BUYGEN
- **Submission:** Hackathon Full-Stack E-Commerce Prototype
- **Tagline:** *"Next-Gen Shopping, Smarter Choices."*

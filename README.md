# Online Movie Ticket Booking 🎬

A modern, full-stack online movie ticket booking platform built with React, TypeScript, Vite, Tailwind CSS, and a Node.js / Modelence backend with MongoDB.

## ✨ Features

- **Movie Catalog & Showtimes:** Browse trending movies, view descriptions, ratings, genres, and available screening timings.
- **Interactive Seat Selection:** Real-time visual seat map layout with dynamic pricing (Silver, Gold, Platinum).
- **Booking Flow & Confirmation:** Seamless checkout flow with instant booking confirmation and printable/saveable tickets.
- **User Authentication:** User sign-up, sign-in, and session management.
- **My Bookings:** View history of active and past movie reservations.
- **Responsive Design:** Dark-themed UI optimized for both desktop and mobile screens.

## 🛠 Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - TanStack React Query
  - Lucide React Icons
- **Backend & Database:**
  - Node.js & TypeScript
  - Modelence framework
  - MongoDB (with local / in-memory auto-starter)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pranavkalepk2007-debug/online-movie-ticket-booking.git
   cd online-movie-ticket-booking
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```
   Or on Windows, simply double-click `run.bat` or `start.bat`.

5. **Open in browser:**
   Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📁 Project Structure

```
├── src/
│   ├── client/
│   │   ├── assets/       # Icons and media
│   │   ├── components/   # UI and reusable components
│   │   ├── pages/        # Views (HomePage, SeatSelection, etc.)
│   │   ├── router.tsx    # Client routes
│   │   └── index.tsx     # App entry
│   └── server/
│       ├── movies/       # Movie endpoints and DB collections
│       ├── migrations/   # Database seeds and initial setup
│       └── app.ts        # Server entry
├── run.bat               # Windows launcher script
├── start.bat             # Alternative launcher script
└── package.json
```

## 📄 License

This project is licensed under the MIT License.

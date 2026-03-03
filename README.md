# 🔗 Ebun's Unique URL Shortener

A 3-tier-featured URL shortener built with **Node.js and Express**, supporting custom aliases, soft deletion with restore windows, file persistence, rate limiting, and a simple browser UI with clipboard support.

---

## 🚀 Live Demo

👉 https://unique-url-shortener.onrender.com

## 📂 GitHub Repository

👉 https://github.com/ebun-amoo/unique-url-shortener

---

# ✨ Features

## 1️⃣ Custom Alias Support
- Users can provide their own alias when shortening a URL.
- If no alias is provided, a random one is generated.
- Alias collision detection prevents duplicates.
- Expired aliases can be reused.

Example:
```
POST /shorten
{
  "url": "https://google.com",
  "alias": "search"
}
```

---

## 2️⃣ Soft Delete + 10-Day Restore Window

Instead of permanently deleting links immediately:

- `DELETE /:alias` marks a link as deleted.
- Deleted links can be restored within the expiration window.
- After the expiration window passes, the link is permanently removed.

---

## 3️⃣ File Persistence with Buffered Writes

The app:
- Loads data from `db.json` on startup.
- Saves changes using a buffered write system.
- Prevents excessive disk writes by batching updates.

---

## 4️⃣ Rate Limiting (429 Protection)

The app uses `express-rate-limit` to prevent abuse:

- Maximum 10 requests per minute per IP.
- Returns HTTP `429 Too Many Requests` when exceeded.

---

## 5️⃣ Browser UI + Clipboard Support

The home route `/` provides a minimal frontend interface:

- Enter a URL
- Optionally provide a custom alias
- Generate short link
- Copy to clipboard with one click

---

# 🛠 Tech Stack

- Node.js
- Express.js
- express-rate-limit
- File System (fs)
- Vanilla HTML + JavaScript (no frontend framework)

---

# 📦 Installation & Local Setup

### 1. Clone the repository

```
git clone https://github.com/ebun-amoo/unique-url-shortener.git
```

### 2. Install dependencies

```
npm install
```

### 3. Start the server

```
npm start
```

The app will run on:

```
http://localhost:3000
```

---

# 📌 API Endpoints

### Shorten a URL
```
POST /shorten
```

### Redirect to Original URL
```
GET /:alias
```

### Soft Delete a URL
```
DELETE /:alias
```

### Restore a Deleted URL
```
PATCH /restore/:alias
```

---

# 📚 What This Project Demonstrates

- RESTful API design
- Resource lifecycle management
- Soft delete + restore patterns
- Time-based expiration logic
- Middleware usage
- File persistence strategies
- Rate limiting
- Basic frontend-backend integration

---

# 👩🏽‍💻 Author

Ebun

---

# 📄 License

This project is for educational purposes.
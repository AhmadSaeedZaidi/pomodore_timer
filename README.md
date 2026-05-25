# Hatsune Miku Pomodoro Timer

A state-driven Pomodoro timer featuring meme sound effects, session tracking (local storage, resets daily), and a vibrant Hatsune Miku visual theme.

## How to Run Locally

### Option A: Using Node.js (Recommended)

**Prerequisites:** Node.js & npm installed.

1. Install development dependencies:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm start
   ```
3. Open your browser to the local address provided in the terminal (usually `http://127.0.0.1:8080`).

---

### Option B: Using Python

If you do not have Node.js installed, you can serve the directory using Python.

1. Start the HTTP server from the project directory:
   ```bash
   # Python 3
   python3 -m http.server 8080
   ```
2. Open your browser and navigate to `http://localhost:8080`.

## Deployed Application
The application is automatically deployed via GitHub Actions and is live at:
**[github pages link](https://ahmadsaeedzaidi.github.io/pomodore-timer)**

## Features
- **Configurable Intervals**: Adjust Focus, Short Break, and Long Break times dynamically.
- **Full cycle**: Automatically chains 4 Focus sessions into a Long Break, auto-resuming timers between short breaks to maintain flow.
- **Persistent History**: Daily sessions are saved to `localStorage`, tracking durations and timestamps. History automatically clears at midnight.
- **Break Time Pop-up**: A full-screen visual modal enforces context switching when it's time to rest.
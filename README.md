<div align="center">
  <img src="public/favicon.png" alt="Boothly Logo" width="120" />
  <h1>📸 Boothly</h1>
  <p><strong>The internet's most aesthetic, client-side digital photobooth.</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#architecture">Architecture</a>
  </p>
</div>

<br/>

## ✨ About The Project

Boothly is a beautifully crafted, modern web application that recreates the emotional, nostalgic experience of a real-life Korean/Japanese photobooth directly in your browser. Built entirely client-side for maximum privacy and performance, Boothly offers live CSS filtering, customizable photostrip generation, and interactive drag-and-drop sticker mechanics.

It was designed with a massive focus on **UI/UX, Glassmorphism aesthetics, and buttery-smooth 60fps animations**.

---

## 🚀 Key Features

- **Cinematic Preloader:** A jaw-dropping, split-screen aperture reveal animation that hooks users immediately.
- **Client-Side Privacy:** Zero images are sent to a server. Everything from camera streaming to final image compositing is done locally using HTML5 Canvas.
- **Automated Capture Sequence:** 3...2...1 countdown logic with simulated camera flashes and Web Audio API synthesized shutter sounds.
- **Live Video Filters:** 12 gorgeous real-time CSS filters (e.g., Kawaii, Retro Film, Noir, Vintage) applied directly to the webcam feed.
- **Aesthetic Strip Generation:** 4 distinct layouts (Classic, Grid, Polaroid, Film) and 10 dynamic color themes.
- **Interactive Customization:** Drag, drop, and place 35+ aesthetic stickers onto your final print using intuitive physics.
- **High-Res Export:** Composites DOM layers and Canvas data into a high-quality PNG for immediate download or native OS sharing via `html2canvas`.
- **Integrated Synth Audio:** Custom Web Audio API integration for authentic mechanical printer whirrs and UI feedback without downloading external SFX files.

---

## 🛠 Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Vanilla CSS (CSS Variables, Glassmorphism, Advanced Keyframes)
- **Animations:** Framer Motion
- **Canvas Rendering:** `html2canvas`, Native HTML5 Canvas API
- **Audio:** Custom Web Audio API Synthesizer

---

## 💻 Quick Start

To get a local copy up and running, follow these simple steps.

### Prerequisites
* Node.js (v18+)
* npm or yarn

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/boothly.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

> **Note**: Camera access requires localhost or a secure context (HTTPS) to function correctly due to browser security policies.

---

## 📂 Architecture Overview

```text
src/
├── components/
│   ├── booth/         # Core booth state machine (Camera, Entry, Countdown)
│   ├── filters/       # Live video filter selection panel
│   ├── landing/       # Cinematic landing page UI sections
│   ├── layout/        # Navbar, Footer, and the Preloader
│   └── strip/         # Canvas generation, Stickers, and Download UI
├── constants/         # App configs (Filters, Themes, Stickers, Layouts)
├── context/           # Global state (BoothContext, ThemeContext)
├── hooks/             # Custom hooks (useAudio, useCamera, useCountdown)
├── pages/             # Route pages (LandingPage.jsx, BoothPage.jsx)
└── utils/             # Helper logic (stripBuilder.js for Canvas rendering)
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with 🤍 and lots of code.</p>
</div>

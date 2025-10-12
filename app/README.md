<p align="center">
  <img src="public/Borgo-Landscape.jpg" width="600" alt="Borgo Batone – Strategix-AI" />
</p>

<h1 align="center">🎬 Strategix-AI Movie Demo</h1>
<p align="center"><b>Lokale KI · DSGVO-konform · Modular</b></p>

---

**Stand:** 10. Oktober 2025  
**Status:** ✅ Stabil & funktionsfähig  

---

## 🚀 Überblick

Interaktive Web-Demo für den **Strategix-AI Erklärfilm**  
mit synchronisiertem Video, Q&A-Einblendungen und Hero-Bild.

**Features:**
- Hero-Sektion mit *Borgo-Landscape.jpg*  
- Lokales Video (`/public/video.mp4`) mit funktionierenden Zeitmarken  
- Dynamische Q&A-Blasen während der Wiedergabe  
- Kapitel-Navigation mit Sprung zu Zeitpunkten  
- Platzhalter für Chat-/Signal-Integration  
- Vollständig DSGVO-konform und lokal lauffähig  

---

## 📂 Projektstruktur

```bash
strategix-ai-movie/
├── app/
│   ├── page.tsx          → Startseite mit Hero + Video-Demo
│   ├── demo/page.tsx     → Chat-Demo-Platzhalter
│   └── Movie.tsx         → Hauptkomponente (Video + Q&A)
├── public/
│   ├── Borgo-Landscape.jpg
│   ├── poster.jpg (optional)
│   └── video.mp4
├── package.json
└── next.config.js
```

---

## 🧠 Nutzung

```bash
# Development-Server starten
npm run dev

# Im Browser öffnen:
http://localhost:8050/
```

> 💡 **Tipp:** Falls Port 8050 bereits belegt ist:
> ```bash
> lsof -ti :8050 | xargs kill -9
> npm run dev
> ```

---

## 💾 Backup / Version sichern

```bash
cd /Users/svenfriess/Projekte/50_strategix-AI
zip -r strategix-ai-movie_STABLE_$(date +%Y-%m-%d).zip strategix-ai-movie
```

Optional mit Git-Commit:
```bash
git add .
git commit -m "Stable Movie-Demo with Hero + Video timestamps"
```

---

## 🧩 Hinweise

- Läuft auf **Next.js 15 + TailwindCSS + Framer Motion**
- Kompatibel mit lokalem **Ollama-Setup / Signal-Bridge**
- Ideale Basis für **Pilot-Demos** (KMU, Bildung, Tourismus, Recht)

---

© 2025 **Strategix-AI**  
_Lokale KI-Lösungen · DSGVO-konform · Modular_

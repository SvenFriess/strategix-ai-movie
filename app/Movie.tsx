import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, MessageCircle, ChevronRight, Clock, X, ListVideo } from "lucide-react";

/**
 * Strategix-AI: Video + zeitcodierte Q&A + Kapitel + (optional) Chat-Panel
 * ---------------------------------------------------------------
 * ✅ Drop-in React-Komponente – läuft in Next.js (app/pages) oder Vite
 * ✅ Tailwind für Styles (minimal), framer-motion für sanfte Übergänge
 * ✅ Zeitcodierte Fragen/Antworten (JSON) werden passend eingeblendet
 * ✅ Kapitel-Navigation (anklickbar) springt zu Video-Zeitpunkten
 * ✅ Chat-Button öffnet ein seitliches Panel (Platzhalter für Bot-Demo)
 *
 * ▶ Nutzung in Next.js (empfohlen):
 * 1) Tailwind einrichten (npx tailwindcss init -p) und globals.css einbinden
 * 2) Diese Datei in /app/page.tsx oder /pages/index.tsx einfügen
 * 3) Assets/Video nach /public legen und videoSrc anpassen
 * 4) npm run dev
 *
 * ▶ Nutzung in Vite-React:
 * 1) npm create vite@latest myapp -- --template react
 * 2) Tailwind konfigurieren (siehe Tailwind Docs für Vite)
 * 3) Diese Datei als src/App.jsx speichern
 * 4) npm run dev
 *
 * ▶ GitHub Pages (statisch):
 * - Vite: mit gh-pages deployen (build + push auf gh-pages Branch)
 * - Next: mit next export (Static HTML Export) oder über ein Hosting mit Node
 */

// --- Demo-Daten (bitte durch echte Inhalte ersetzen) ---
const demoVideo = {
  title: "Strategix-AI – Lokaler Chatbot Erklärfilm",
  // Lege eine MP4-Datei (H.264 + AAC) unter /public/video.mp4 ab
  videoSrc: "/video.mp4",
  poster: "/poster.jpg", // optionales Poster-Bild
};

const demoChapters = [
  { time: 0, label: "Intro" },
  { time: 25, label: "Was ist Strategix‑AI?" },
  { time: 60, label: "Lokales LLM + Ollama" },
  { time: 95, label: "Anwendungsfälle" },
  { time: 115, label: "Security & DSGVO" },
  { time: 125, label: "Outro / CTA" },
];

const demoQA = [
  { time: 12, q: "Brauche ich Internet/Cloud?", a: "Nein – das Modell läuft lokal (Ollama), keine Cloud nötig." },
  { time: 45, q: "Was bedeutet DSGVO‑konform?", a: "Daten bleiben on‑premise. Keine Drittanbieter-Übermittlung." },
  { time: 70, q: "Welches Modell wird genutzt?", a: "Z. B. Mistral, Phi oder DeepSeek‑R1 über Ollama – modular austauschbar." },
  { time: 100, q: "Für wen eignet sich das?", a: "KMU, Bildung, Tourismus, Recht – überall, wo Datenschutz zählt." },
  { time: 118, q: "Wie starte ich einen Pilot?", a: "Kontakt aufnehmen, Use Case klären, 2‑Wochen‑Pilot mit lokalem Setup." },
];

// --- Hilfsfunktionen ---
const formatTime = (t) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

function useActiveQA(videoRef, qa, threshold = 2) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      const t = el.currentTime;
      // Suche die letzte QA, deren time innerhalb threshold Sekunden vergangen ist
      // und die noch nicht "zu alt" ist (z. B. 12s angezeigt)
      const candidate = [...qa]
        .filter((item) => t >= item.time && t - item.time <= 12)
        .sort((a, b) => b.time - a.time)[0];
      setActive(candidate || null);
    };

    el.addEventListener("timeupdate", onTimeUpdate);
    return () => el.removeEventListener("timeupdate", onTimeUpdate);
  }, [videoRef, qa, threshold]);

  return active;
}

// --- Hauptkomponente ---
export default function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Header />
        <VideoQnA
          title={demoVideo.title}
          videoSrc={demoVideo.videoSrc}
          poster={demoVideo.poster}
          chapters={demoChapters}
          qa={demoQA}
        />
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Strategix‑AI</h1>
          <p className="text-sm text-neutral-500">Lokale Chatbots · DSGVO · Modular</p>
        </div>
        <a
          href="https://strategix-ai.tech"
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border px-4 py-2 text-sm hover:shadow-sm"
        >
          Website öffnen
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t pt-6 text-xs text-neutral-500">
      <p>
        © {new Date().getFullYear()} Strategix‑AI. Demo-Komponente: Video + Q&A. Ersetzbare Demo-Daten in
        <code className="mx-1 rounded bg-neutral-100 px-1">demoVideo</code>,
        <code className="mx-1 rounded bg-neutral-100 px-1">demoChapters</code> und
        <code className="mx-1 rounded bg-neutral-100 px-1">demoQA</code>.
      </p>
    </footer>
  );
}

function VideoQnA({ title, videoSrc, poster, chapters = [], qa = [] }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);

  const activeQA = useActiveQA(videoRef, qa);

  const onTogglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const seekTo = (t) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = t;
    el.play();
    setPlaying(true);
  };

  // Kapitel-Balkenbreite
  const chapterPercents = useMemo(() => {
    // Wir lesen Dauer erst nach Metadata ein
    const duration = videoRef.current?.duration || 0;
    if (!duration || chapters.length === 0) return [];
    const items = chapters.map((c, idx) => {
      const start = c.time;
      const end = chapters[idx + 1]?.time ?? duration;
      const width = ((end - start) / duration) * 100;
      return { ...c, width };
    });
    return items;
  }, [chapters, videoRef.current?.duration]);

  return (
    <section className="grid gap-6 md:grid-cols-12">
      <div className="md:col-span-8">
        <div className="relative overflow-hidden rounded-2xl shadow-sm">
          <video
            ref={videoRef}
            className="h-auto w-full"
            poster={poster}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            controls
            src={videoSrc}
          />

          {/* Play/Pause Overlay-Button (optional) */}
          <button
            onClick={onTogglePlay}
            className="absolute bottom-3 right-3 rounded-full border bg-white/80 p-2 backdrop-blur hover:bg-white"
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Zeitcodierte Q&A Blase */}
          <AnimatePresence>
            {activeQA && (
              <motion.div
                key={activeQA.time}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="pointer-events-auto absolute left-3 top-3 max-w-[92%] rounded-2xl border bg-white/95 p-4 shadow-md"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
                  <Clock size={14} />
                  <span>{formatTime(activeQA.time)}</span>
                </div>
                <p className="font-medium">{activeQA.q}</p>
                <p className="mt-1 text-sm text-neutral-700">{activeQA.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kapitel-Leiste */}
        <div className="mt-3 rounded-xl border p-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <ListVideo size={18} /> Kapitel
          </div>
          <div className="flex w-full overflow-hidden rounded-xl border">
            {chapterPercents.length > 0 ? (
              chapterPercents.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => seekTo(c.time)}
                  onMouseEnter={() => setHoverTime(c.time)}
                  onMouseLeave={() => setHoverTime(null)}
                  style={{ width: `${c.width}%` }}
                  className="group relative h-8 flex-1 border-r last:border-r-0 hover:bg-neutral-50"
                  title={`${c.label} • ${formatTime(c.time)}`}
                >
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-neutral-500">
                    {c.label}
                  </span>
                  {hoverTime === c.time && (
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-neutral-900 px-2 py-0.5 text-[10px] text-white">
                      {formatTime(c.time)}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="h-8 w-full animate-pulse bg-neutral-100" />
            )}
          </div>
        </div>
      </div>

      {/* Seitenleiste: Fragenliste & CTA */}
      <aside className="md:col-span-4">
        <div className="sticky top-6 space-y-4">
          <div className="rounded-2xl border p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Passende Fragen & Antworten zum Video. Klicke auf eine Frage, um zur Stelle zu springen.
            </p>
          </div>

          {/* Fragenliste */}
          <div className="rounded-2xl border p-2">
            <ul className="divide-y">
              {qa.map((item) => (
                <li key={item.time} className="">
                  <button
                    onClick={() => seekTo(item.time)}
                    className="group flex w-full items-start gap-3 p-3 text-left hover:bg-neutral-50"
                  >
                    <div className="mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] text-neutral-600">
                      {formatTime(item.time)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium leading-snug">{item.q}</p>
                      <p className="mt-0.5 text-sm text-neutral-600">{item.a}</p>
                    </div>
                    <ChevronRight className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat CTA */}
          <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fragen zum System?</p>
                <p className="text-sm text-neutral-600">Öffne die Demo-Chat-Seite.</p>
              </div>
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm hover:shadow-sm"
              >
                <MessageCircle size={16} /> Chat öffnen
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Chat-Panel (Platzhalter) */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <p className="font-semibold">Strategix‑AI Demo‑Chat</p>
                <button
                  className="rounded-full border p-1 hover:bg-neutral-50"
                  onClick={() => setShowChat(false)}
                  aria-label="Panel schließen"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <p className="text-sm text-neutral-600">
                  Hier könnte eine Einbettung zu deiner bestehenden Bot‑Demo erscheinen
                  (z. B. Link zu <code>/demo</code> oder eine iFrame‑Integration). Für eine
                  Signal‑ oder lokale LLM‑Brücke lässt sich hier später eine Websocket‑/API‑Anbindung ergänzen.
                </p>
              </div>
              <div className="border-t p-3 text-center text-xs text-neutral-500">
                Placeholder – keine Live‑Verbindung konfiguriert.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

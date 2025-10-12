"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, MessageCircle, ChevronRight, Clock, X, ListVideo } from "lucide-react";
import Link from "next/link";

/**
 * strategix-AI: Video + zeitcodierte Q&A + Kapitel + (optional) Chat-Panel
 * - Tailwind Styles, framer-motion für Übergänge
 * - Hero mit Borgo-Landscape.jpg (liegt in /public)
 */

// --- Demo-Daten (bei Bedarf anpassen) ---
const demoVideo = {
  title: "strategix-AI – Lokaler Chatbot Erklärfilm",
  videoSrc: "/video.mp4", // /public/video.mp4
  poster: "/poster.jpg",  // optional
};

const demoChapters: { time: number; label: string }[] = [
  { time: 0, label: "Intro" },
  { time: 25, label: "Was ist strategix-AI?" },
  { time: 60, label: "Lokales LLM + Ollama" },
  { time: 95, label: "Anwendungsfälle" },
  { time: 115, label: "Security & DSGVO" },
  { time: 125, label: "Outro / CTA" },
];

const demoQA: { time: number; q: string; a: string }[] = [
  { time: 12, q: "Brauche ich Internet/Cloud?", a: "Nein – das Modell läuft lokal (Ollama), keine Cloud nötig." },
  { time: 45, q: "Was bedeutet **DSGVO-konform**?", a: "Daten bleiben on-premise. Keine Drittanbieter-Übermittlung." },
  { time: 70, q: "Welches Modell wird genutzt?", a: "Z. B. `Mistral`, `Phi` oder `DeepSeek-R1` über Ollama – modular austauschbar." },
  { time: 100, q: "Für wen eignet sich das?", a: "KMU, Bildung, Tourismus, Recht – überall, wo **Datenschutz** zählt." },
  { time: 118, q: "Wie starte ich einen Pilot?", a: "Kontakt aufnehmen, Use Case klären, 2-Wochen-Pilot mit lokalem Setup." },
];

// --- Mini-Markdown: **bold**, `code`, Zeilenumbrüche ---
function md(s: string) {
  return s
    .replace(/\n/g, "<br/>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

// --- Hilfsfunktionen ---
const formatTime = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

function useActiveQA(
  videoRef: React.RefObject<HTMLVideoElement>,
  qa: { time: number; q: string; a: string }[],
  threshold = 2
) {
  const [active, setActive] = useState<{ time: number; q: string; a: string } | null>(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onTimeUpdate = () => {
      const t = el.currentTime;
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
    <>
      {/* 🎥 Hero – volle Breite, sicheres Rendering */}
      <section className="relative h-[60vh] w-full overflow-hidden" style={{ background: '#f00' }}>
        <img
          src="/Borgo-Landscape.jpg"
          alt="Borgo Batone"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="sync"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="text-4xl font-bold drop-shadow-lg">Borgo Batone</h1>
          <p className="mt-3 text-lg text-white/90 max-w-2xl px-4">
            Referenzprojekt für lokale KI – Mac Mini, DSGVO, modular.
          </p>
        </div>
      </section>

      {/* Inhalt */}
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
    </>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">strategix-AI</h1>
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
        © {new Date().getFullYear()} strategix-AI. Demo-Komponente: Video + Q&amp;A. Ersetzbare Demo-Daten in
        <code className="mx-1 rounded bg-neutral-100 px-1">demoVideo</code>,
        <code className="mx-1 rounded bg-neutral-100 px-1">demoChapters</code> und
        <code className="mx-1 rounded bg-neutral-100 px-1">demoQA</code>.
      </p>
    </footer>
  );
}

function VideoQnA({
  title,
  videoSrc,
  poster,
  chapters = [],
  qa = [],
}: {
  title: string;
  videoSrc: string;
  poster?: string;
  chapters: { time: number; label: string }[];
  qa: { time: number; q: string; a: string }[];
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(0); // zuverlässige Kapitelbreite

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

  const onLoadedMetadata = () => {
    const d = videoRef.current?.duration ?? 0;
    setDuration(d);
  };

  const seekTo = (t: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = t;
    el.play();
    setPlaying(true);
  };

  const chapterPercents = useMemo(() => {
    if (!duration || chapters.length === 0) return [];
    return chapters.map((c, idx) => {
      const start = c.time;
      const end = chapters[idx + 1]?.time ?? duration;
      const width = ((end - start) / duration) * 100;
      return { ...c, width };
    });
  }, [chapters, duration]);

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
            onLoadedMetadata={onLoadedMetadata}
            controls
            playsInline
            preload="metadata"
            src={videoSrc}
          />

          {/* Play/Pause Overlay-Button */}
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
                <div
                  className="mt-1 text-sm text-neutral-700"
                  dangerouslySetInnerHTML={{ __html: md(activeQA.a) }}
                />
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
                <li key={item.time}>
                  <button
                    onClick={() => seekTo(item.time)}
                    className="group flex w-full items-start gap-3 p-3 text-left hover:bg-neutral-50"
                  >
                    <div className="mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] text-neutral-600">
                      {formatTime(item.time)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium leading-snug">{item.q}</p>
                      <div
                        className="mt-0.5 text-sm text-neutral-600"
                        dangerouslySetInnerHTML={{ __html: md(item.a) }}
                      />
                    </div>
                    <ChevronRight className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat CTA – als Link zu /demo */}
          <div className="rounded-2xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fragen zum System?</p>
                <p className="text-sm text-neutral-600">
                  Öffne die Demo-Chat-Seite oder lies später die FAQ.
                </p>
              </div>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm hover:shadow-sm"
              >
                <MessageCircle size={16} /> Chat öffnen
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Chat-Panel (Platzhalter – optional, falls nicht genutzt bleibt es unsichtbar) */}
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
                <p className="font-semibold">strategix-AI Demo-Chat</p>
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
                  Hier könnte eine Einbettung zu deiner bestehenden Bot-Demo erscheinen
                  (z. B. Link zu <code>/demo</code> oder eine iFrame-Integration). Für eine
                  Signal- oder lokale LLM-Brücke lässt sich hier später eine Websocket-/API-Anbindung ergänzen.
                </p>
              </div>
              <div className="border-t p-3 text-center text-xs text-neutral-500">
                Placeholder – keine Live-Verbindung konfiguriert.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
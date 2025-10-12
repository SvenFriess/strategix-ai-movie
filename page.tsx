cat > app/fixeddemo/page.tsx <<'EOF'
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FIXED_RESPONSES } from "./fixedResponses";

export default function FixedDemoPage() {
  const keys = useMemo(() => Object.keys(FIXED_RESPONSES), []);
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  const k = keys[idx] ?? "";
  const answer = FIXED_RESPONSES[k] ?? "";

  const next = useCallback(() => { setIdx(i => (i + 1) % keys.length); setShowAnswer(false); }, [keys.length]);
  const prev = useCallback(() => { setIdx(i => (i - 1 + keys.length) % keys.length); setShowAnswer(false); }, [keys.length]);
  const toggleAnswer = useCallback(() => setShowAnswer(s => !s), []);
  const copyAnswer = useCallback(async () => { try { await navigator.clipboard.writeText(answer); } catch {} }, [answer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") { e.preventDefault(); copyAnswer(); return; }
      const key = e.key.toLowerCase();
      if (key === "n" || key === "arrowright") { e.preventDefault(); next(); }
      else if (key === "p" || key === "arrowleft") { e.preventDefault(); prev(); }
      else if (key === "a" || key === "enter" || key === " ") { e.preventDefault(); toggleAnswer(); }
      else if (key === "+" || key === "=") { e.preventDefault(); setFontScale(s => Math.min(1.6, Number((s + 0.1).toFixed(2)))); }
      else if (key === "-" || key === "_") { e.preventDefault(); setFontScale(s => Math.max(0.8, Number((s - 0.1).toFixed(2)))); }
      else if (key === "0") { e.preventDefault(); setFontScale(1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleAnswer, copyAnswer]);

  const styles = {
    page: { fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif", background:"#0b0c10", color:"#eaf1f1", minHeight:"100vh", padding:"3rem 2rem", display:"flex", justifyContent:"center" } as const,
    wrap: { width:"min(1100px,100%)", transform:`scale(${fontScale})`, transformOrigin:"top left" } as const,
    headerRow: { display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem" } as const,
    badge: { fontSize:"0.95rem", letterSpacing:"0.02em", color:"#0b0c10", background:"#9ee7d6", borderRadius:"999px", padding:"0.35rem 0.75rem" } as const,
    title: { fontSize:"2.2rem", fontWeight:800, margin:0 } as const,
    sub: { opacity:0.7, marginTop:"0.2rem", fontSize:"1rem" } as const,
    card: { background:"#111318", border:"1px solid #20242c", borderRadius:"18px", padding:"1.5rem", margin:"1.25rem 0", boxShadow:"0 10px 40px rgba(0,0,0,0.35)" } as const,
    qKey: { opacity:0.8, fontSize:"1rem", marginBottom:"0.2rem" } as const,
    question: { fontSize:"1.65rem", lineHeight:1.35, margin:0, fontWeight:700 } as const,
    answer: { fontSize:"1.25rem", lineHeight:1.55, whiteSpace:"pre-wrap", margin:0 } as const,
    buttons: { display:"flex", gap:"0.6rem", flexWrap:"wrap", marginTop:"1rem" } as const,
    btn: { background:"#1b1f29", border:"1px solid #2a3040", color:"#eaf1f1", padding:"0.75rem 1rem", borderRadius:12, fontSize:"1rem", cursor:"pointer" } as const,
    btnPrimary: { background:"#3aa57a", border:"1px solid #3aa57a", color:"#0b0c10", fontWeight:700 } as const,
    grid: { display:"grid", gridTemplateColumns:"1fr 1.2fr", gap:"1.25rem", alignItems:"start" } as const,
    list: { background:"#0f1116", border:"1px solid #1e2330", borderRadius:16, padding:"0.75rem", maxHeight:"70vh", overflow:"auto" } as const,
    listItem: { display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.5rem", padding:"0.6rem 0.8rem", borderRadius:12, cursor:"pointer", border:"1px solid transparent" } as const,
    listItemActive: { background:"#161a22", border:"1px solid #293247" } as const,
    hint: { opacity:0.65, fontSize:"0.95rem" } as const,
    zoomHint: { opacity:0.55, fontSize:"0.9rem", marginLeft:"auto" } as const,
  };

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.headerRow}>
          <div style={styles.badge}>Borgo-Bot · Feste Antworten (Offline)</div>
          <div style={styles.zoomHint}>Zoom: [+] [−] [0]</div>
        </div>
        <h1 style={styles.title}>Q&A für die Filmaufnahme</h1>
        <p style={styles.sub}>{idx + 1} / {keys.length} · Taste <b>N</b> weiter, <b>P</b> zurück · <b>A/⏎</b> Antwort · <b>Cmd/Ctrl+C</b> kopieren</p>

        <div style={styles.grid}>
          <div style={styles.list} aria-label="Themenliste">
            {keys.map((key, i) => {
              const active = i === idx;
              return (
                <div key={key} style={{ ...styles.listItem, ...(active ? styles.listItemActive : {}) }}
                  onClick={() => { setIdx(i); setShowAnswer(false); }}>
                  <div style={{ fontSize:"1.05rem", fontWeight:600 }}>{key}</div>
                  <div style={styles.hint}>Enter/A zum Anzeigen</div>
                </div>
              );
            })}
          </div>

          <section>
            <div style={styles.card}>
              <div style={styles.qKey}>Key: {k}</div>
              <h2 style={styles.question}>Frage: {k}</h2>
              {showAnswer ? (
                <pre style={{ ...styles.answer, marginTop:"1rem" }}>{answer}</pre>
              ) : (
                <div style={{ ...styles.answer, opacity:0.5, marginTop:"1rem" }}>
                  (Antwort ausgeblendet – drücke <b>A</b> oder <b>Enter</b>)
                </div>
              )}
              <div style={styles.buttons}>
                <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={toggleAnswer}>
                  {showAnswer ? "Antwort verbergen (A/⏎)" : "Antwort anzeigen (A/⏎)"}
                </button>
                <button style={styles.btn} onClick={prev}>◀︎ Zurück (P/←)</button>
                <button style={styles.btn} onClick={next}>Weiter (N/→) ▶︎</button>
                <button style={styles.btn} onClick={copyAnswer} title="In Zwischenablage kopieren">⧉ Kopieren (⌘/Ctrl+C)</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
EOF

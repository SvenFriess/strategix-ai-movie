export default function Demo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-neutral-900">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Strategix-AI Demo-Chat</h1>
        <p className="text-neutral-600">
          Hier entsteht die Live-Anbindung deines lokalen Bots
          (Signal-Bridge, Ollama, oder API).
        </p>
        <a
          href="/"
          className="inline-block rounded-2xl border px-4 py-2 text-sm hover:shadow-sm"
        >
          ← Zurück zum Video
        </a>
      </div>
    </div>
  );
}
const LAYERS = [
  {
    title: "Frontend",
    color: "blue",
    items: [
      { name: "React 18", desc: "Component-based UI with hooks" },
      { name: "Vite", desc: "Fast build tool with HMR" },
      { name: "Tailwind CSS", desc: "Utility-first styling with dark mode" },
      { name: "Vitest", desc: "Unit tests with Testing Library" },
    ],
  },
  {
    title: "Backend",
    color: "green",
    items: [
      { name: "Django 5", desc: "REST API with DRF viewsets" },
      { name: "PostgreSQL 16", desc: "Relational data storage" },
      { name: "Gunicorn", desc: "Production WSGI server" },
      { name: "WhiteNoise", desc: "Static file serving" },
    ],
  },
  {
    title: "DevOps & Infrastructure",
    color: "purple",
    items: [
      { name: "Docker", desc: "Multi-stage builds, Compose orchestration" },
      { name: "Nginx", desc: "Reverse proxy with SSL termination" },
      { name: "GCP", desc: "e2-micro VM with static IP" },
      { name: "Let's Encrypt", desc: "Auto-renewed HTTPS certificates" },
      { name: "CI/CD", desc: "Makefile-driven build & deploy pipeline" },
    ],
  },
];

const COLOR_MAP = {
  blue: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    border: "border-blue-400 dark:border-blue-500",
  },
  green: {
    badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    border: "border-green-400 dark:border-green-500",
  },
  purple: {
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    border: "border-purple-400 dark:border-purple-500",
  },
};

export default function Project() {
  return (
    <section id="project" className="py-16 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          About This Project
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-3xl">
          This resume website is itself a full-stack project — designed, built,
          and deployed by me to demonstrate practical engineering skills beyond
          what a PDF can show.
        </p>

        {/* Architecture overview */}
        <div className="mb-10 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Architecture
          </h3>
          <pre className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 overflow-x-auto leading-relaxed font-mono">
{`Internet (HTTPS)
    │
    ▼
┌─────────────────────────────────────────┐
│  Nginx  (SSL termination, reverse proxy)│
├─────────────────────────────────────────┤
│  /          → React SPA (static build)  │
│  /api/      → Django REST Framework     │
│  /admin/    → Django Admin              │
└─────────┬──────────────┬────────────────┘
          │              │
          ▼              ▼
   ┌───────────┐  ┌──────────────┐
   │ Frontend  │  │   Backend    │
   │ (Nginx)   │  │  (Gunicorn)  │
   └───────────┘  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ PostgreSQL   │
                  └──────────────┘`}
          </pre>
        </div>

        {/* Tech stack cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map((layer) => (
            <div
              key={layer.title}
              className={`rounded-xl bg-white dark:bg-gray-800 border-l-4 ${COLOR_MAP[layer.color].border} p-5 shadow-sm`}
            >
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                {layer.title}
              </h3>
              <ul className="space-y-3">
                {layer.items.map((item) => (
                  <li key={item.name} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 inline-block px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${COLOR_MAP[layer.color].badge}`}
                    >
                      {item.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Dark Mode", icon: "🌙" },
            { label: "Fully Responsive", icon: "📱" },
            { label: "Dockerized", icon: "🐳" },
            { label: "HTTPS / SSL", icon: "🔒" },
          ].map((h) => (
            <div
              key={h.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <span className="text-xl">{h.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {h.label}
              </span>
            </div>
          ))}
        </div>

        {/* Source code link */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Source code available on{" "}
          <a
            href="https://github.com/rshveda/my-resume"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  );
}

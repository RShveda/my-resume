import { useFetch } from "../hooks/useFetch";

const CATEGORY_LABELS = {
  Programming: "Programming",
  Frameworks: "Frameworks & Technologies",
  Databases: "Databases",
  DevOps: "DevOps & Cloud",
  AI: "AI-Assisted Development",
  Methodologies: "Methodologies",
};

const CATEGORY_ORDER = ["Programming", "Frameworks", "Databases", "DevOps", "AI", "Methodologies"];

export default function Skills() {
  const { data: skills, loading, error } = useFetch("/skills/");

  if (loading) {
    return (
      <section id="skills" className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Technical Skills</h2>
          <p className="text-gray-500 dark:text-gray-400">Loading skills...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="skills" className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Technical Skills</h2>
          <p className="text-red-500">Failed to load skills.</p>
        </div>
      </section>
    );
  }

  const grouped = {};
  for (const skill of skills || []) {
    if (!grouped[skill.category]) grouped[skill.category] = [];
    grouped[skill.category].push(skill);
  }

  return (
    <section id="skills" className="py-16 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Technical Skills</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_ORDER.map((cat) =>
            grouped[cat] ? (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {CATEGORY_LABELS[cat]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {grouped[cat].map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}

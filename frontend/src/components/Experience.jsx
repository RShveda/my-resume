import { useFetch } from "../hooks/useFetch";

function formatDate(dateStr) {
  if (!dateStr) return "Present";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function Experience() {
  const { data: experiences, loading, error } = useFetch("/experience/");

  if (loading) {
    return (
      <section id="experience" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Professional Experience</h2>
          <p className="text-gray-500 dark:text-gray-400">Loading experience...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="experience" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Professional Experience</h2>
          <p className="text-red-500">Failed to load experience.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Professional Experience</h2>
        <div className="space-y-10">
          {(experiences || []).map((exp) => (
            <div key={exp.id} className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-800">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-gray-900" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exp.role}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(exp.start_date)} &ndash; {formatDate(exp.end_date)}
                  {exp.is_remote && " · Remote"}
                  {exp.location && !exp.is_remote && ` · ${exp.location}`}
                </p>
              </div>
              <ul className="mt-3 space-y-2">
                {exp.bullets.map((bullet) => (
                  <li key={bullet.id} className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex">
                    <span className="text-blue-400 mr-2 mt-1 flex-shrink-0">&#8226;</span>
                    <span>{bullet.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

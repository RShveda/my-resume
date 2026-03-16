export default function Education() {
  return (
    <section id="education" className="py-16 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Education</h2>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bachelor's Degree in Finance
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Kyiv European University, Lviv Affiliate
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">2004 &ndash; 2008</p>
        </div>
      </div>
    </section>
  );
}

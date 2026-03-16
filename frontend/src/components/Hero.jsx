export default function Hero() {
  return (
    <section id="hero" className="py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-start gap-8">
        <img
          src="/avatar.jpeg"
          alt="Roman Shveda"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900 flex-shrink-0"
        />
        <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
          Roman Shveda
        </h1>
        <p className="mt-2 text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-medium">
          Senior Software Engineer
        </p>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Portugal &middot;{" "}
          <a href="mailto:rshveda@gmail.com" className="hover:text-blue-600 dark:hover:text-blue-400">
            rshveda@gmail.com
          </a>{" "}
          &middot;{" "}
          <a
            href="https://linkedin.com/in/roman-shveda"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            LinkedIn
          </a>
        </p>
        <p className="mt-6 max-w-3xl text-gray-700 dark:text-gray-300 leading-relaxed">
          Senior Software Engineer with 6 years of hands-on backend and frontend
          development experience and 5 years of technical project management
          background. Deep expertise in Python, PostgreSQL, and full-stack
          development, specializing in enterprise application development for
          hospitality, manufacturing, and e-commerce industries. Proven track
          record of designing modular solutions, implementing engineering best
          practices (CI/CD, code reviews, unit testing), and delivering
          business-critical features.
        </p>
        </div>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Roman Shveda. Built with React, Django &amp; PostgreSQL.
      </div>
    </footer>
  );
}

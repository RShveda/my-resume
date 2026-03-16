import { useFetch } from "../hooks/useFetch";

export default function Certifications() {
  const { data: certs, loading, error } = useFetch("/certifications/");

  if (loading) {
    return (
      <section id="certifications" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Certifications</h2>
          <p className="text-gray-500 dark:text-gray-400">Loading certifications...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="certifications" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Certifications</h2>
          <p className="text-red-500">Failed to load certifications.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="certifications" className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Certifications</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(certs || []).map((cert) => (
            <div
              key={cert.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">{cert.name}</h3>
              {cert.issuer && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cert.issuer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { domains } from "@/lib/data";

export default function DomainsSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Domain</h2>
          <p className="text-gray-500">7 career paths — all with structured 6-month roadmaps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain) => (
            <div key={domain.id} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group">
              <div className="text-3xl mb-3">{domain.icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{domain.title}</h3>
              <p className="text-blue-600 text-sm font-medium mb-2">{domain.duration}</p>
              <p className="text-gray-500 text-sm mb-4">{domain.description}</p>
              <div className="flex flex-wrap gap-2">
                {domain.topics.map((topic) => (
                  <span key={topic} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{topic}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

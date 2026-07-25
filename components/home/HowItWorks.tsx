import { howItWorks } from "@/lib/data";

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500">4 simple steps — week by week, project by project</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {howItWorks.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector line */}
              {index < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-blue-100 z-0" />
              )}
              <div className="relative z-10 bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-semibold text-blue-600 mb-1">Step {item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
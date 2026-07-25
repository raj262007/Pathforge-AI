import { domains, pricingPlans } from "@/lib/data";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
        <p className="text-gray-500">7 domains — beginner to advanced. Choose your path.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {domains.map((d) => (
          <div key={d.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all">
            <div className="text-3xl mb-3">{d.icon}</div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{d.title}</h3>
            <p className="text-blue-600 text-sm mb-2">{d.duration}</p>
            <p className="text-gray-500 text-sm mb-4">{d.description}</p>
            <div className="flex flex-wrap gap-2">
              {d.topics.map((t) => (<span key={t} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{t}</span>))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Pricing Plans</h2>
        <p className="text-gray-500">Start free — upgrade when ready</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <div key={plan.name} className={`rounded-2xl p-6 border-2 ${plan.highlighted ? "border-blue-600 shadow-xl" : "border-gray-200"}`}>
            {plan.highlighted && <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full inline-block mb-3">Most Popular</div>}
            <h3 className="font-bold text-xl text-gray-900 mb-1">{plan.name}</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {plan.price === 0 ? "Free" : `Rs ${plan.price}`}
              {plan.price > 0 && <span className="text-sm text-gray-400 font-normal">/month</span>}
            </div>
            <div className="space-y-2 mb-6">
              {plan.features.map((f) => (<div key={f} className="flex gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>{f}</div>))}
              {plan.notIncluded.map((f) => (<div key={f} className="flex gap-2 text-sm text-gray-400"><span>✗</span>{f}</div>))}
            </div>
            <Link href="/admission" className={`block text-center py-2 rounded-xl font-medium transition-colors ${plan.highlighted ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>{plan.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

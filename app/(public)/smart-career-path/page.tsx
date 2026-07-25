import Link from "next/link";

export default function SmartCareerPathPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-block bg-blue-100 text-blue-700 text-sm px-4 py-1 rounded-full mb-6">🔒 Selected Students Only — Login Required</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Smart Career Path</h1>
        <p className="text-gray-500 mb-10">This section is only for selected students. Login with the credentials sent to your email.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
          {[
            { icon: "📺", title: "Weekly Lectures", desc: "Top 3 YouTube lectures every week" },
            { icon: "📝", title: "AI Quiz", desc: "20 MCQ + 10 text — 75% to pass" },
            { icon: "💻", title: "Project Resources", desc: "Pass quiz → projects unlock" },
          ].map((item) => (
            <div key={item.title} className="border border-gray-200 rounded-xl p-4 flex gap-3 items-start bg-white">
              <span className="text-2xl">{item.icon}</span>
              <div><div className="font-semibold text-gray-900 text-sm">{item.title}</div><div className="text-gray-500 text-xs mt-1">{item.desc}</div></div>
            </div>
          ))}
        </div>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block">Login to Dashboard</Link>
        <div className="mt-4"><Link href="/admission" className="text-blue-600 text-sm hover:underline">Apply for free seat →</Link></div>
      </div>
    </div>
  );
}
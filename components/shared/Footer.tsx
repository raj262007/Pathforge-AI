import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">PathForge AI</h3>
          <p className="text-sm leading-relaxed">AI-powered career roadmap platform. From beginner to job-ready in 6 months.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <Link href="/team" className="hover:text-white transition-colors">Team</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/admission" className="hover:text-white transition-colors">Apply Now</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <div className="flex flex-col gap-2 text-sm">
            <p>📧 pathforgeai@gmail.com</p>
            <p>💬 WhatsApp: +91 XXXXXXXXXX</p>
            <p>📍 Ahmedabad, Gujarat</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-10 pt-6 text-center text-sm">
        © 2026 PathForge AI — All rights reserved.
      </div>
    </footer>
  );
}

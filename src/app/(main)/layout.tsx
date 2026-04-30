import { Icon } from "@iconify/react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ContactSupportButton from "@/components/ContactSupportButton";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 px-4 py-4 md:px-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/home" className="group flex items-center gap-2">
            <Logo className="w-11 h-11 transition-transform group-hover:scale-105" />
          </Link>

          {/* Center: Nav Menu */}
          <nav className="hidden md:flex items-center gap-10">
            {["Home", "Dashboard", "About Us", "Proof"].map((item) => (
              <Link 
                key={item}
                href={item === "Home" ? "/home" : item === "Dashboard" ? "/track" : item === "About Us" ? "/about-us" : item === "Proof" ? "/validation" : "#"} 
                className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-indigo-600 after:transition-all hover:after:w-full"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Right: Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
              <Icon icon="lucide:menu" className="text-2xl"></Icon>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-16 md:px-8">
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-slate-200 py-16 px-4 md:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-6">
            <Logo className="w-12 h-12" />
            <p className="text-sm text-slate-500 max-w-xs text-center md:text-left leading-relaxed">
              &copy; 2024 Civic Services Authority. Empowring communities through transparent governance.
            </p>
          </div>
          
          <div className="flex gap-10 md:gap-24">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</span>
              <div className="flex flex-col gap-3">
                <ContactSupportButton />
                <div className="text-slate-600 font-medium flex flex-col sm:flex-row sm:items-center gap-1">
                  Help Center: <span className="text-slate-500 text-sm">Gokul Road Hubli, Karnataka</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {[ 
              { id: 'twitter', icon: "simple-icons:x" }, 
              { id: 'facebook', icon: "lucide:facebook" }, 
              { id: 'mail', icon: "lucide:mail" } 
            ].map((social) => (
              <a key={social.id} href="#" className="w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm">
                <Icon icon={social.icon} className="text-xl"></Icon>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

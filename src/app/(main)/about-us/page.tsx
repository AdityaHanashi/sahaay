"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import VoiceTriggerButton from "@/components/VoiceTriggerButton";

export default function AboutUsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-24 animate-fade-in-up pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 shadow-sm animate-bounce-slow">
          <Icon icon="lucide:award" className="text-lg" />
          The Sahaay Mission
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
          Empowering Every <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">Citizen’s Voice.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
          Sahaay is more than just a platform—it is a bridge between the people and the authorities. We leverage modern technology to ensure that no grievance goes unheard, from the bustling cities to the quietest rural villages.
        </p>
      </section>

      {/* Impact Story 1: Rural Empowerment */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 order-2 lg:order-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Technology for the <br />
            <span className="text-indigo-600">Grassroots Level.</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            We believe innovation is only successful when it reaches everyone. Our platform is designed to be lightweight and offline-aware, ensuring that farmers and rural citizens can report issues directly from their fields.
          </p>
          <div className="space-y-4">
            {[
              { icon: "lucide:wifi-off", text: "Works on low-bandwidth networks" },
              { icon: "lucide:map-pin", text: "Automated geolocation for accurate reporting" },
              { icon: "lucide:smartphone", text: "Simple, high-contrast interface" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon icon={item.icon} className="text-xl" />
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
        <div className="relative order-1 lg:order-2 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-[3rem] rotate-3 scale-105 opacity-10 group-hover:rotate-1 transition-transform duration-700"></div>
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
            <img src="/farmer.png" alt="Empowered Farmer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          </div>
        </div>
      </section>

      {/* Impact Story 2: Community Voice */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-bl from-violet-500 to-fuchsia-500 rounded-[3rem] -rotate-3 scale-105 opacity-10 group-hover:-rotate-1 transition-transform duration-700"></div>
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
            <img src="/community.png" alt="Community Interaction" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          </div>
        </div>
        <div className="space-y-8">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Inclusive by Design, <br />
            <span className="text-violet-600">Driven by Voice.</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Our unique "Call Assistant" and voice-to-text features ensure that language barriers or literacy levels never stop a citizen from seeking help. We empower communities to validate each other's reports, creating a self-correcting ecosystem of trust.
          </p>
          <div className="space-y-4">
            {[
              { icon: "lucide:mic", text: "Assisted submissions via voice & call" },
              { icon: "lucide:users", text: "Community-driven proof & validation" },
              { icon: "lucide:heart", text: "Built for empathy and fast resolution" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Icon icon={item.icon} className="text-xl" />
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 bg-slate-50 rounded-[4rem] px-10 md:px-20 border border-slate-100 shadow-inner">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4">The Sahaay Core Values</h2>
          <p className="text-slate-500 font-medium">Why we do what we do.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: "Transparency", icon: "lucide:eye", desc: "Every step of your grievance is tracked in real-time, from submission to resolution." },
            { title: "Inclusivity", icon: "lucide:globe", desc: "From tech-experts to rural citizens, Sahaay is built for everyone." },
            { title: "Efficiency", icon: "lucide:zap", desc: "Smart routing ensures your problem reaches the right department in seconds." }
          ].map((value) => (
            <div key={value.title} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Icon icon={value.icon} className="text-3xl" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{value.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Need Help Banner (Already existing style, but integrated here) */}
      <section className="glass-panel p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden bg-white/60">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/10 flex-shrink-0 animate-pulse-slow">
              <Icon icon="lucide:help-circle" className="text-5xl" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Need Immediate Help?</h2>
              <p className="text-slate-500 text-lg font-medium">Our support team is available 24/7 to guide you through the process.</p>
            </div>
          </div>
          <div className="premium-button px-12 py-5 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center gap-3">
            <Icon icon="lucide:phone-call" />
            +91-800-123-4567
          </div>
        </div>
      </section>

      <div className="text-center pt-10">
        <Link href="/home" className="text-slate-400 hover:text-indigo-600 font-black tracking-widest text-xs transition-colors flex items-center justify-center gap-2 group">
          <Icon icon="lucide:home" className="text-lg group-hover:-translate-y-0.5 transition-transform" />
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}

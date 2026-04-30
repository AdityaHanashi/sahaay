"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function HomePage() {
  const [role, setRole] = useState("Citizen");
  const [otherRole, setOtherRole] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  // Load persistence
  useEffect(() => {
    const savedRole = localStorage.getItem("sahaay_user_role");
    if (savedRole) {
      if (["Citizen", "Student", "Officer", "Farmer"].includes(savedRole)) {
        setRole(savedRole);
      } else {
        setRole("Other");
        setOtherRole(savedRole);
        setIsOtherSelected(true);
      }
    }
  }, []);

  // Save persistence
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole !== "Other") {
      setIsOtherSelected(false);
      localStorage.setItem("sahaay_user_role", newRole);
    } else {
      setIsOtherSelected(true);
    }
  };

  const handleOtherRoleInput = (val: string) => {
    setOtherRole(val);
    localStorage.setItem("sahaay_user_role", val);
  };

  return (
    <>
      {/* Hero & Role Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 animate-fade-in-up">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-indigo-100/50">
            <Icon icon="lucide:info" className="text-sm"></Icon>
            Public Service Gateway
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Your Voice Matters for a <br className="hidden md:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Better Community.</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
            A simplified portal to report issues, track resolutions, and help maintain community standards. Accessible, transparent, and fair.
          </p>
        </div>

        {/* Role Selector Dropdown */}
        <div className="relative min-w-[300px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Identity Selection</label>
            {role && !isOtherSelected && (
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">Active: {role}</span>
            )}
          </div>
          <div className="space-y-4">
            <div className="relative group">
              <select 
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="appearance-none w-full bg-white/80 border border-slate-200 text-slate-900 py-4.5 pl-12 pr-12 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold cursor-pointer premium-input"
              >
                <option value="Citizen">Citizen</option>
                <option value="Student">Student</option>
                <option value="Officer">Officer</option>
                <option value="Farmer">Farmer</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center group-hover:scale-110 transition-transform">
                <Icon icon="lucide:user" className="text-2xl text-indigo-500"></Icon>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon icon="lucide:chevron-down" className="text-xl"></Icon>
              </div>
            </div>

            {/* Expandable Other Input */}
            {isOtherSelected && (
              <div className="animate-fade-in-up">
                <input 
                  type="text"
                  maxLength={20}
                  value={otherRole}
                  onChange={(e) => handleOtherRoleInput(e.target.value)}
                  placeholder="Enter your role"
                  className="w-full bg-white border border-slate-200 text-slate-900 py-3.5 px-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm shadow-sm"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-2 px-1 font-medium italic">{20 - otherRole.length} chars remaining</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Grid with Staggered Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 animate-stagger">
        {/* Card 1: Submit Report */}
        <Link href="/submit" className="card-hover group glass-panel p-8 rounded-[2.5rem] flex flex-col items-start h-full stagger-child">
          <div className="w-20 h-20 bg-white shadow-xl shadow-blue-500/10 rounded-[1.5rem] flex items-center justify-center mb-8 border border-slate-100 group-hover:rotate-6 transition-transform">
            <img src="/submit-icon.png" alt="Submit Report" className="w-14 h-14 object-contain" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Submit Report</h3>
          <p className="text-slate-500 leading-relaxed mb-10 flex-grow text-[15px]">
            Have a problem or concern? Send us a message and we will help you fix it.
          </p>
          <div className="inline-flex items-center gap-2 font-bold text-indigo-600 group-hover:gap-4 transition-all">
            Get Started
            <Icon icon="lucide:arrow-right" className="text-xl"></Icon>
          </div>
        </Link>

        {/* Card 2: Community Validation */}
        <Link href="/validation" className="card-hover group glass-panel p-8 rounded-[2.5rem] flex flex-col items-start h-full stagger-child">
          <div className="w-20 h-20 bg-white shadow-xl shadow-emerald-500/10 rounded-[1.5rem] flex items-center justify-center mb-8 border border-slate-100 group-hover:rotate-6 transition-transform">
            <img src="/validation-icon.png" alt="Community Validation" className="w-14 h-14 object-contain" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Validation</h3>
          <p className="text-slate-500 leading-relaxed mb-10 flex-grow text-[15px]">
            See what others are reporting and help us verify if the issues are real.
          </p>
          <div className="inline-flex items-center gap-2 font-bold text-emerald-600 group-hover:gap-4 transition-all">
            Review List
            <Icon icon="lucide:arrow-right" className="text-xl"></Icon>
          </div>
        </Link>

        {/* Card 3: Track Complaints */}
        <Link href="/track" className="card-hover group glass-panel p-8 rounded-[2.5rem] flex flex-col items-start h-full stagger-child">
          <div className="w-20 h-20 bg-white shadow-xl shadow-amber-500/10 rounded-[1.5rem] flex items-center justify-center mb-8 border border-slate-100 group-hover:rotate-6 transition-transform">
            <img src="/track-icon.png" alt="Track Complaints" className="w-14 h-14 object-contain" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Track Complaints</h3>
          <p className="text-slate-500 leading-relaxed mb-10 flex-grow text-[15px]">
            Already sent a report? Type your ID to see how it is progressing.
          </p>
          <div className="inline-flex items-center gap-2 font-bold text-amber-600 group-hover:gap-4 transition-all">
            Find My Case
            <Icon icon="lucide:arrow-right" className="text-xl"></Icon>
          </div>
        </Link>

        {/* Card 4: Admin Panel */}
        <Link href="/admin" className="card-hover group glass-panel p-8 rounded-[2.5rem] flex flex-col items-start h-full stagger-child">
          <div className="w-20 h-20 bg-white shadow-xl shadow-purple-500/10 rounded-[1.5rem] flex items-center justify-center mb-8 border border-slate-100 group-hover:rotate-6 transition-transform">
            <img src="/admin-icon.png" alt="Admin Panel" className="w-14 h-14 object-contain" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Admin Panel</h3>
          <p className="text-slate-500 leading-relaxed mb-10 flex-grow text-[15px]">
            Secure access for authorized personnel to manage community data.
          </p>
          <div className="inline-flex items-center gap-2 font-bold text-purple-600 group-hover:gap-4 transition-all">
            Staff Login
            <Icon icon="lucide:arrow-right" className="text-xl"></Icon>
          </div>
        </Link>
      </div>

      {/* CTA / Assistance Section */}
      <div className="mt-24 p-12 md:p-16 glass-panel rounded-[3rem] flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-colors"></div>
        <div className="w-28 h-28 bg-white shadow-2xl rounded-full flex items-center justify-center text-indigo-600 shrink-0 relative">
          <Icon icon="lucide:help-circle" className="text-6xl animate-pulse"></Icon>
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
        </div>
        <div className="text-center lg:text-left flex-grow">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Need Immediate Help?</h2>
          <p className="text-slate-600 text-xl leading-relaxed max-w-2xl">
            Our support team is available 24/7 to guide you through the reporting process if you are confused.
          </p>
        </div>
        <a href="#" className="premium-button whitespace-nowrap px-10 py-5 text-white font-bold rounded-2xl flex items-center gap-3 ml-auto shadow-xl">
          Contact Support
          <Icon icon="lucide:phone-call" className="text-xl"></Icon>
        </a>
      </div>

    </>
  );
}

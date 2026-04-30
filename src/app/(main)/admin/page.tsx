"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [department, setDepartment] = useState("Cybercrime");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const creds: Record<string, { email: string; pass: string; prefix: string }> = {
      "Cybercrime": { email: "cyber@admin.com", pass: "1234", prefix: "A" },
      "Income Tax": { email: "tax@admin.com", pass: "1234", prefix: "B" },
      "Municipal": { email: "municipal@admin.com", pass: "1234", prefix: "C" },
       "Social Welfare": { email: "welfare@admin.com", pass: "1234", prefix: "D" }
     };

    const target = creds[department];

    if (target && username === target.email && password === target.pass) {
      localStorage.setItem("adminDept", target.prefix);
      router.push("/admin/dashboard?dept=" + department);
    } else {
      setError("Invalid credentials for the selected department.");
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in-up">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Icon icon="lucide:settings" className="text-4xl animate-spin-slow"></Icon>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
        <p className="text-slate-500 mt-3 text-lg font-medium">Secure access for authorized personnel.</p>
      </div>

      <form onSubmit={handleLogin} className="glass-panel p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden bg-white/60">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
        
        {error && (
          <div className="p-5 bg-red-50 text-red-700 text-sm font-black rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
            <Icon icon="lucide:alert-circle" className="text-xl"></Icon> {error}
          </div>
        )}

        <div className="relative z-10 space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Department</label>
            <div className="relative">
              <select 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="appearance-none w-full bg-white border border-slate-200 text-slate-900 py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold cursor-pointer premium-input"
              >
                <option value="Cybercrime">Cybercrime</option>
                <option value="Income Tax">Income Tax</option>
                <option value="Municipal">Municipal</option>
                 <option value="Social Welfare">Social Welfare</option>
               </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon icon="lucide:chevron-down" className="text-xl"></Icon>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin email"
                className="w-full bg-white border border-slate-200 text-slate-900 py-4 px-6 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold premium-input"
                required
              />
              <Icon icon="lucide:mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-300"></Icon>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 text-slate-900 py-4 px-6 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold premium-input"
                required
              />
              <Icon icon="lucide:lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-300"></Icon>
            </div>
          </div>

          <button type="submit" className="w-full py-5 premium-button text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]">
            Access Dashboard
          </button>
        </div>
        
        <p className="text-[10px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest leading-relaxed">
          SECURE PROTOCOL ACTIVE &bull; ENCRYPTED SESSION
        </p>
      </form>
    </div>
  );
}

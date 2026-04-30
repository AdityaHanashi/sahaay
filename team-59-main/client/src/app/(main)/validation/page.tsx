"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";

export default function ValidationPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [userArea, setUserArea] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'agree' | 'disagree'>>({});

  useEffect(() => {
    const savedVotes = localStorage.getItem('sahaay_user_votes');
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "complaints"), 
      where("status", "in", ["Submitted", "In Progress", "Action Taken", "Under Review"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        complaintId: doc.data().complaintId,
        title: doc.data().issueTitle,
        area: doc.data().area,
        dept: doc.data().department,
        status: doc.data().status,
        proofImages: doc.data().proofImages || [],
        description: doc.data().description,
        agreeCount: doc.data().agreeCount || 0,
        disagreeCount: doc.data().disagreeCount || 0,
        createdAt: doc.data().createdAt?.toMillis() || 0,
        votes: {
          agree: doc.data().agreeCount || 0,
          disagree: doc.data().disagreeCount || 0
        },
        ...doc.data()
      })).sort((a, b) => {
        if (b.agreeCount !== a.agreeCount) return b.agreeCount - a.agreeCount;
        return b.createdAt - a.createdAt;
      });
      setReports(data);
      setIsLoading(false);
      
      // Keep selected report data fresh
      if (selectedReport) {
        const updated = data.find(r => r.id === selectedReport.id);
        if (updated) setSelectedReport(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedReport?.id]);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    
    const area = await new Promise<string>((resolve) => {
      if (!navigator.geolocation) {
        resolve("Unknown Area");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD1hUYxjmaZTauEfYlZ3i9dXFWUfGxQk0E`);
            const data = await res.json();
            const area = data.results[0]?.formatted_address || "Unknown Area";
            console.log("Location fetched:", area);
            resolve(area);
          } catch {
            resolve("Unknown Area");
          }
        },
        () => resolve("Unknown Area"),
        { timeout: 5000 }
      );
    });

    setUserArea(area);
    setIsDetectingLocation(false);
  };

  const filteredReports = userArea 
    ? reports.filter(report => report.area === userArea)
    : reports;

  const handleVote = async (reportId: string, complaintId: string, voteType: 'agree' | 'disagree') => {
    if (isVoting) return;
    
    const previousVote = userVotes[reportId];
    if (previousVote === voteType) return;

    setIsVoting(true);
    try {
      const reportRef = doc(db, "complaints", reportId);
      let updates: any = {};
      
      if (!previousVote) {
        updates[voteType === 'agree' ? 'agreeCount' : 'disagreeCount'] = increment(1);
      } else {
        updates[previousVote === 'agree' ? 'agreeCount' : 'disagreeCount'] = increment(-1);
        updates[voteType === 'agree' ? 'agreeCount' : 'disagreeCount'] = increment(1);
      }

      await updateDoc(reportRef, updates);

      await addDoc(collection(db, "votes"), {
        complaintId: complaintId,
        reportId: reportId,
        vote: voteType,
        previousVote: previousVote || null,
        timestamp: serverTimestamp()
      });

      const newVotes = { ...userVotes, [reportId]: voteType };
      setUserVotes(newVotes);
      localStorage.setItem('sahaay_user_votes', JSON.stringify(newVotes));
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to record vote.");
    } finally {
      setIsVoting(false);
    }
  };

  const mostReported = useMemo(() => {
    if (!userArea || reports.length === 0) return null;
    
    const localReports = reports.filter(r => r.area === userArea);
    if (localReports.length === 0) return null;

    const deptCounts: Record<string, number> = {};
    localReports.forEach(r => {
      deptCounts[r.dept] = (deptCounts[r.dept] || 0) + 1;
    });

    const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0][0];
    const topIssue = localReports.find(r => r.dept === topDept)?.title || "";

    return { dept: topDept, issue: topIssue };
  }, [userArea, reports]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Submitted': return 'bg-amber-50 text-amber-600 border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'In Progress':
      case 'Under Review': return 'bg-blue-50 text-blue-600 border-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.1)]';
      case 'Action Taken': return 'bg-purple-50 text-purple-600 border-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.1)]';
      case 'Resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-200 shadow-[0_0_15px_rgba(220,38,38,0.1)]';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  if (selectedReport) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <button onClick={() => setSelectedReport(null)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-black transition-all group">
          <Icon icon="lucide:arrow-left" className="group-hover:-translate-x-1 transition-transform"></Icon> Back to List
        </button>
        <div className="glass-panel p-10 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/5 to-transparent -z-10"></div>
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200">{selectedReport.dept}</span>
            <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 ${getStatusStyle(selectedReport.status)}`}>{selectedReport.status}</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight leading-tight">{selectedReport.title}</h1>
          <p className="text-slate-400 flex items-center gap-2 mb-10 font-bold">
            <Icon icon="lucide:map-pin" className="text-indigo-500"></Icon> {selectedReport.area} &bull; <span className="font-mono text-slate-300">ID: {selectedReport.complaintId}</span>
          </p>
          
          {selectedReport.proofImages && selectedReport.proofImages.length > 0 ? (
            <div className="w-full h-80 rounded-[2.5rem] mb-10 border border-slate-100 overflow-hidden shadow-inner">
               {selectedReport.proofImages[0].startsWith('data:application/pdf') ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                    <Icon icon="lucide:file-text" className="text-6xl text-indigo-500 mb-4"></Icon>
                    <p className="text-slate-900 font-bold">Document attached</p>
                 </div>
               ) : (
                 <img src={selectedReport.proofImages[0]} alt="Proof" className="w-full h-full object-cover" />
               )}
            </div>
          ) : (
            <div className="w-full h-80 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 border border-slate-100 overflow-hidden group shadow-inner">
              <div className="text-center group-hover:scale-110 transition-transform duration-700">
                <Icon icon="lucide:image" className="text-6xl mb-3 text-slate-200"></Icon>
                <p className="text-slate-400 font-bold text-sm tracking-wide">No Proof Provided</p>
              </div>
            </div>
          )}

          <p className="text-xl text-slate-700 leading-relaxed mb-12 italic border-l-4 border-indigo-500 pl-6">
            "{selectedReport.description || "No detailed description provided."}"
          </p>

          <div className="border-t border-slate-100 pt-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center tracking-tight">Do you agree with this report?</h3>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button 
                onClick={() => handleVote(selectedReport.id, selectedReport.complaintId, 'agree')}
                disabled={isVoting}
                className={`flex-1 py-5 border-2 rounded-[2rem] font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${
                  userVotes[selectedReport.id] === 'agree' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                }`}
              >
                <Icon icon="lucide:thumbs-up" className="text-2xl"></Icon> Agree ({selectedReport.votes.agree})
              </button>
              <button 
                onClick={() => handleVote(selectedReport.id, selectedReport.complaintId, 'disagree')}
                disabled={isVoting}
                className={`flex-1 py-5 border-2 rounded-[2rem] font-black text-lg transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${
                  userVotes[selectedReport.id] === 'disagree' 
                    ? 'bg-red-600 text-white border-red-600 shadow-red-500/20' 
                    : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                }`}
              >
                <Icon icon="lucide:thumbs-down" className="text-2xl"></Icon> Disagree ({selectedReport.votes.disagree})
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Community Validation</h1>
          <p className="text-slate-500 mt-4 text-xl leading-relaxed">Help verify issues reported within your 3km radius.</p>
        </div>
        
        <div className="relative w-full md:w-[450px] group">
          <input type="text" placeholder="Search by area or ID..." className="w-full py-5 pl-14 pr-16 glass-panel border-slate-200 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold premium-input" />
          <Icon icon="lucide:search" className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-slate-300 group-focus-within:text-indigo-500 transition-colors"></Icon>
          <button 
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm disabled:opacity-50" 
            title="Auto-detect location"
          >
            {isDetectingLocation ? (
              <Icon icon="lucide:loader-2" className="text-xl animate-spin"></Icon>
            ) : (
              <Icon icon="lucide:navigation" className="text-xl"></Icon>
            )}
          </button>
        </div>
      </div>

      {userArea && mostReported && (
        <div className="mb-12 p-8 glass-panel-dark text-white rounded-[2.5rem] flex items-center gap-6 shadow-2xl relative overflow-hidden group animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent pointer-events-none"></div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform">
            <Icon icon="lucide:trending-up" className="text-3xl text-indigo-300"></Icon>
          </div>
          <div className="relative z-10">
            <p className="text-xs text-indigo-300 uppercase tracking-[0.2em] font-black mb-1">Most Reported in your area</p>
            <p className="text-2xl font-bold tracking-tight">{mostReported.dept} <span className="text-indigo-400 text-lg ml-2 font-medium">({mostReported.issue})</span></p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center p-20 glass-panel rounded-[3rem] text-slate-500 animate-fade-in-up">
          <Icon icon="lucide:loader-2" className="text-5xl text-indigo-500 animate-spin mx-auto mb-6"></Icon>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">Loading Local Reports</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-stagger">
          {filteredReports.map((report) => (
            <div key={report.id} onClick={() => setSelectedReport(report)} className="card-hover glass-panel p-8 rounded-[2.5rem] cursor-pointer flex flex-col h-full stagger-child group">
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200">{report.dept}</span>
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 ${getStatusStyle(report.status)}`}>{report.status}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 line-clamp-2 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">{report.title}</h3>
              <div className="text-slate-400 text-sm flex items-center gap-2 mb-8 flex-grow font-bold">
                <Icon icon="lucide:map-pin" className="text-indigo-500"></Icon> {report.area}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                <div className="flex items-center gap-5 text-sm font-black text-slate-600">
                  <span className="flex items-center gap-1.5 text-emerald-600"><Icon icon="lucide:thumbs-up" className="text-lg"></Icon> {report.votes.agree}</span>
                  <span className="flex items-center gap-1.5 text-red-500"><Icon icon="lucide:thumbs-down" className="text-lg"></Icon> {report.votes.disagree}</span>
                </div>
                <span className="text-sm font-black text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">Review <Icon icon="lucide:arrow-right"></Icon></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

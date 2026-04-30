"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function TrackComplaintsPage() {
  const [searchId, setSearchId] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
   const [isDetectingLocation, setIsDetectingLocation] = useState(false);
   const [selectedReport, setSelectedReport] = useState<any>(null);
   const [isImageModalOpen, setIsImageModalOpen] = useState(false);
   const [modalImage, setModalImage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.data().complaintId,
        title: doc.data().issueTitle,
        area: doc.data().area,
        status: doc.data().status,
        ...doc.data()
      }));
      setReports(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

    setSelectedArea(area);
    setIsDetectingLocation(false);
  };

  // Filter logic
  let filteredReports = reports;
  
  if (selectedArea !== "All") {
    filteredReports = filteredReports.filter(report => report.area === selectedArea);
  }
  
  if (searchId) {
    filteredReports = filteredReports.filter(report => report.id.toLowerCase().includes(searchId.toLowerCase()));
  }

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

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-16">
        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/10">
          <Icon icon="lucide:search" className="text-5xl"></Icon>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-purple-600">
          Track Your Complaint
        </h1>
        <p className="text-slate-500 mt-4 text-xl">Search by ID or browse reports by area.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-16">
        <div className="relative flex-grow group">
          <Icon icon="lucide:search" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-2xl group-focus-within:text-indigo-500 transition-colors"></Icon>
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search by ID (e.g. A-1234)" 
            className="w-full py-5 pl-14 pr-6 glass-panel border-slate-200 rounded-2xl shadow-sm focus:outline-none font-mono text-xl premium-input" 
          />
        </div>
        
        <div className="relative flex items-center">
          <button 
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-3 px-8 py-5 glass-panel border-slate-200 rounded-2xl shadow-sm hover:bg-white hover:border-indigo-200 transition-all text-slate-700 font-bold group disabled:opacity-50"
            title="Auto-detect location to filter"
          >
            {isDetectingLocation ? (
              <Icon icon="lucide:loader-2" className="text-2xl text-indigo-500 animate-spin"></Icon>
            ) : (
              <Icon icon="lucide:map-pin" className="text-2xl text-indigo-500 group-hover:animate-bounce"></Icon>
            )}
            <span>{isDetectingLocation ? (selectedArea !== "All" ? selectedArea : 'Detecting...') : (selectedArea !== "All" ? selectedArea : 'Detect Location')}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 animate-stagger">
        {isLoading ? (
          <div className="text-center p-20 glass-panel rounded-[3rem] text-slate-500 animate-fade-in-up">
            <Icon icon="lucide:loader-2" className="text-5xl text-indigo-500 animate-spin mx-auto mb-6"></Icon>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">Fetching Real-time Records</p>
          </div>
        ) : filteredReports.length > 0 ? (
          filteredReports.map(result => (
               <div 
                 key={result.id} 
                 onClick={() => result.status === 'Resolved' && setSelectedReport(result)}
                 className={`card-hover glass-panel p-8 rounded-[2.5rem] stagger-child group ${result.status === 'Resolved' ? 'cursor-pointer border-emerald-100 hover:border-emerald-200' : 'cursor-default'}`}
               >
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
                 <div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Complaint ID</p>
                   <p className="text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">{result.id}</p>
                 </div>
                 <div className={`px-6 py-2.5 border-2 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2.5 w-fit ${getStatusStyle(result.status)}`}>
                   <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                   {result.status}
                 </div>
               </div>
               
               <div className="flex justify-between items-start gap-4">
                 <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{result.title}</h3>
                 {result.status === 'Resolved' && (
                   <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg animate-pulse-slow">
                     View Resolution
                   </span>
                 )}
               </div>
               <div className="flex items-center gap-2 text-slate-400 font-bold">
                 <Icon icon="lucide:map-pin" className="text-indigo-500"></Icon>
                 <span className="text-sm uppercase tracking-wider">{result.area}</span>
               </div>

               {/* Vibrant Amazon-style Progress Tracker for Card */}
               {result.status !== 'Rejected' && (
                 <div className="mt-10 pt-8 border-t border-slate-100 relative px-4">
                   <div className="absolute top-[44px] left-4 right-4 h-1.5 bg-slate-100 rounded-full"></div>
                   <div 
                     className="absolute top-[44px] left-4 h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                     style={{ 
                       width: `calc(${
                         result.status === 'Submitted' ? '0%' : 
                         (result.status === 'In Progress' || result.status === 'Under Review') ? '33.33%' :
                         result.status === 'Action Taken' ? '66.66%' : 
                         result.status === 'Resolved' ? '100%' : '0%'
                       } - 16px)` 
                     }}
                   ></div>
                   <div className="relative flex justify-between">
                       {["Submitted", "In Progress", "Action Taken", "Resolved"].map((step, idx) => {
                         const steps = ["Submitted", "In Progress", "Action Taken", "Resolved"];
                         const currentStatus = (result.status === 'Under Review') ? 'In Progress' : result.status;
                         const currentIdx = steps.indexOf(currentStatus);
                         const isCompleted = idx <= currentIdx;
                         const isActive = idx === currentIdx;
                         return (
                         <div key={step} className="flex flex-col items-center gap-3 relative z-10">
                           <div className={`w-4 h-4 rounded-full border-4 transition-all duration-500 ${
                             isCompleted ? 'bg-white border-indigo-600' : 'bg-white border-slate-200'
                           } ${isActive ? 'scale-125 ring-8 ring-indigo-500/10' : ''}`}></div>
                           <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                             isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-900' : 'text-slate-300'
                           }`}>{step}</span>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               )}
             </div>
          ))
        ) : (
          <div className="text-center p-20 glass-panel rounded-[3rem] text-slate-500 animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="lucide:file-question" className="text-5xl text-slate-300"></Icon>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">No reports found.</p>
            <p className="text-lg mt-2 text-slate-400">Try adjusting your search or area filter.</p>
          </div>
        )}
      </div>

       {/* Resolution Details Modal */}
       {selectedReport && (
         <div 
           className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6 animate-fade-in"
           onClick={() => setSelectedReport(null)}
         >
           <div 
             className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
               <div>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Official Resolution Proof</p>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Case <span className="text-emerald-600">{selectedReport.id}</span></h2>
               </div>
               <button 
                 onClick={() => setSelectedReport(null)}
                 className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 shadow-sm"
               >
                 <Icon icon="lucide:x" className="text-2xl"></Icon>
               </button>
             </div>
 
             <div className="p-10 space-y-10">
               <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Admin Statement</p>
                 <div className="text-slate-700 text-lg font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                   {selectedReport.resolutionDesc || "No additional description provided by the authority."}
                 </div>
               </div>
 
               <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Verifiable Proof</p>
                 {selectedReport.resolutionProof ? (
                   <div className="w-full h-80 rounded-[2.5rem] overflow-hidden border-4 border-emerald-50 shadow-2xl">
                     {selectedReport.resolutionProof.startsWith('data:application/pdf') ? (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-indigo-600">
                         <Icon icon="lucide:file-text" className="text-6xl mb-4" />
                         <p className="font-black text-slate-900">Official Document Attached</p>
                         <a 
                           href={selectedReport.resolutionProof} 
                           download={`Resolution_${selectedReport.id}`}
                           className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-black"
                         >
                           Download Proof
                         </a>
                       </div>
                     ) : (
                       <img 
                         src={selectedReport.resolutionProof} 
                         className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500" 
                         alt="Resolution Proof"
                         onClick={() => {
                            setModalImage(selectedReport.resolutionProof);
                            setIsImageModalOpen(true);
                         }}
                       />
                     )}
                   </div>
                 ) : (
                   <div className="w-full h-40 bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
                     <Icon icon="lucide:image-off" className="text-4xl mb-2" />
                     <p className="font-bold">No visual proof uploaded.</p>
                   </div>
                 )}
               </div>
 
               <div className="pt-6 border-t border-slate-100 flex justify-center">
                 <button 
                   onClick={() => setSelectedReport(null)}
                   className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all tracking-widest text-xs uppercase"
                 >
                   Close Resolution Data
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
 
       {/* Full Image Modal for Citizens */}
       {isImageModalOpen && (
         <div 
           className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-fade-in p-10"
           onClick={() => setIsImageModalOpen(false)}
         >
           <button 
             className="absolute top-10 left-10 z-[250] flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black text-xs uppercase tracking-[0.2em] rounded-full border border-white/20 transition-all group shadow-2xl active:scale-95"
             onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
           >
             <Icon icon="lucide:arrow-left" className="text-xl group-hover:-translate-x-1 transition-transform"></Icon> BACK TO RESOLUTION
           </button>
           
           <div className="relative w-full h-full flex items-center justify-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
             <img 
               src={modalImage} 
               alt="Full Proof Preview" 
               className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl shadow-black/50" 
             />
           </div>
         </div>
       )}
    </div>
  );
}
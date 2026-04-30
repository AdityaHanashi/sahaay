"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";

function DashboardContent() {
  const searchParams = useSearchParams();
  const deptName = searchParams.get("dept") || "Cybercrime";
  const [selectedReport, setSelectedReport] = useState<any>(null);
   const [activePrefix, setActivePrefix] = useState<string>("");
 
   const [resDesc, setResDesc] = useState("");
   const [resFile, setResFile] = useState<string>("");
   const [isProcessingRes, setIsProcessingRes] = useState(false);

  useEffect(() => {
    // Get prefix from localStorage set during login
    const savedPrefix = localStorage.getItem("adminDept") || "A";
    setActivePrefix(savedPrefix);
  }, []);

  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activePrefix) return;

    const q = query(collection(db, "complaints"), where("prefix", "==", activePrefix));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        id: doc.data().complaintId,
        title: doc.data().issueTitle,
        area: doc.data().area,
        status: doc.data().status,
        desc: doc.data().description,
        proofImages: doc.data().proofImages || [],
        createdAt: doc.data().createdAt?.toMillis() || 0,
        ...doc.data()
      })).sort((a, b) => b.createdAt - a.createdAt); // Sort locally
      
      setReports(data);
      setIsLoading(false);
      
       // Update selected report if it changes
       if (selectedReport) {
         const updated = data.find(r => r.id === selectedReport.id);
         if (updated) {
           setSelectedReport(updated);
           if (updated.status === "Resolved") {
             setResDesc(updated.resolutionDesc || "");
             setResFile(updated.resolutionProof || "");
           }
         }
       }
     });

    return () => unsubscribe();
  }, [activePrefix, selectedReport?.id]);

  const filteredReports = reports;

  const stats = useMemo(() => [
    { label: "Total Reports", count: filteredReports.length, icon: "lucide:file-text", color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Pending", count: filteredReports.filter(r => r.status === "Submitted").length, icon: "lucide:clock", color: "text-amber-500", bg: "bg-amber-50" },
    { label: "In Progress", count: filteredReports.filter(r => r.status === "In Progress" || r.status === "Under Review" || r.status === "Action Taken").length, icon: "lucide:refresh-cw", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Resolved", count: filteredReports.filter(r => r.status === "Resolved").length, icon: "lucide:check-circle", color: "text-emerald-500", bg: "bg-emerald-50" },
  ], [filteredReports]);

  const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalImage, setModalImage] = useState("");
 
   const compressImage = async (file: File): Promise<string> => {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = (event) => {
         const img = new Image();
         img.src = event.target?.result as string;
         img.onload = () => {
           const canvas = document.createElement("canvas");
           let width = img.width;
           let height = img.height;
           const MAX_WIDTH = 1024;
           if (width > MAX_WIDTH) {
             height *= MAX_WIDTH / width;
             width = MAX_WIDTH;
           }
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext("2d");
           ctx?.drawImage(img, 0, 0, width, height);
           resolve(canvas.toDataURL("image/jpeg", 0.7));
         };
         img.onerror = (err) => reject(err);
       };
       reader.onerror = (err) => reject(err);
     });
   };
 
   const handleResFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
       setIsProcessingRes(true);
       try {
         const file = e.target.files[0];
         if (file.type.startsWith('image/')) {
           const compressed = await compressImage(file);
           setResFile(compressed);
         } else {
           const reader = new FileReader();
           reader.readAsDataURL(file);
           reader.onload = () => setResFile(reader.result as string);
           reader.readAsDataURL(file);
         }
       } catch (err) {
         console.error("File error:", err);
       } finally {
         setIsProcessingRes(false);
       }
     }
   };

  const statusFlow = ["Submitted", "Under Review", "In Progress", "Action Taken", "Resolved"];

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    
    const currentIndex = statusFlow.indexOf(selectedReport.status);
    
    if (currentIndex !== -1 && currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
       
       // Validation for Resolved state
       if (nextStatus === "Resolved") {
         if (!resDesc.trim()) {
           alert("Please provide a resolution description.");
           return;
         }
       }
 
       try {
         const reportRef = doc(db, "complaints", selectedReport.firestoreId);
         const updateData: any = { status: nextStatus };
         
         if (nextStatus === "Resolved") {
           updateData.resolutionDesc = resDesc;
           updateData.resolutionProof = resFile;
         }
 
         await updateDoc(reportRef, updateData);
         console.log("Status updated to:", nextStatus);
         setResDesc("");
         setResFile("");
       } catch (err) {
         console.error("Error updating status:", err);
         alert("Failed to update status.");
       }
     }
  };

  const handleReject = async () => {
    if (!selectedReport) return;
    if (!confirm("Are you sure you want to REJECT this complaint?")) return;
    
    try {
      const reportRef = doc(db, "complaints", selectedReport.firestoreId);
      await updateDoc(reportRef, { status: "Rejected" });
      console.log("Status updated to: Rejected");
    } catch (err) {
      console.error("Error rejecting report:", err);
      alert("Failed to reject report.");
    }
  };

   const handleUpdateResolution = async () => {
     if (!selectedReport || !resDesc.trim()) {
       alert("Please provide a resolution description.");
       return;
     }
     try {
       const reportRef = doc(db, "complaints", selectedReport.firestoreId);
       await updateDoc(reportRef, {
         resolutionDesc: resDesc,
         resolutionProof: resFile
       });
       alert("Resolution proof updated successfully!");
     } catch (err) {
       console.error("Error updating resolution:", err);
       alert("Failed to update resolution proof.");
     }
   };
 
   const localityInsights = useMemo(() => {
    if (filteredReports.length === 0) return [];
    
    const areaCounts: Record<string, number> = {};
    filteredReports.forEach(r => {
      const area = r.area || "Unknown Area";
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });

    const total = filteredReports.length;
    const colors = [
      "from-blue-500 to-indigo-500",
      "from-indigo-500 to-violet-500",
      "from-violet-500 to-purple-500",
      "from-purple-500 to-pink-500"
    ];

    return Object.entries(areaCounts)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [filteredReports]);

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
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring Node: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 font-black">{deptName} Department</span></p>
        </div>
        <div className="flex items-center gap-6">
          <div className="px-5 py-2.5 bg-white/70 backdrop-blur-md text-indigo-700 rounded-2xl text-xs font-black border border-indigo-100 flex items-center gap-3 shadow-xl shadow-indigo-500/5">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            ACTIVE SESSION: {deptName.toUpperCase()}
          </div>
          <Link href="/admin" className="text-slate-400 hover:text-red-500 transition-all font-black text-xs tracking-widest flex items-center gap-2 group">
            <Icon icon="lucide:log-out" className="text-lg group-hover:-translate-x-1 transition-transform"></Icon> LOGOUT
          </Link>
        </div>
      </div>

      {/* Stats with Staggered Entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-stagger">
        {stats.map((stat) => (
          <div key={stat.label} className="card-hover glass-panel p-8 rounded-[2.5rem] flex items-center gap-6 stagger-child group">
            <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform ${stat.bg} ${stat.color}`}>
              <Icon icon={stat.icon} className="text-3xl"></Icon>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Table Container */}
        <div className="lg:col-span-2 glass-panel rounded-[3rem] shadow-2xl overflow-hidden flex flex-col bg-white/60">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/40">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Case Feed <span className="text-slate-400 font-bold ml-2 text-lg">({deptName})</span></h2>
            <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200">System Lock</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 font-black">ID</th>
                  <th className="px-8 py-5 font-black">Issue Title</th>
                  <th className="px-8 py-5 font-black">Area</th>
                  <th className="px-8 py-5 font-black">Status</th>
                  <th className="px-8 py-5 font-black">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 animate-fade-in">
                        <Icon icon="lucide:loader-2" className="text-4xl text-indigo-500 animate-spin"></Icon>
                        <p className="font-bold text-slate-400 tracking-tight">Syncing Database...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-8 py-5 font-mono font-black text-indigo-600 text-sm tracking-widest">{report.id}</td>
                      <td className="px-8 py-5 font-bold text-slate-900 group-hover:translate-x-1 transition-transform">{report.title}</td>
                      <td className="px-8 py-5 text-slate-500 font-medium">{report.area}</td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${getStatusStyle(report.status)}`}>
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="premium-button-mini px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 animate-fade-in">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                          <Icon icon="lucide:inbox" className="text-4xl text-slate-200"></Icon>
                        </div>
                        <p className="font-bold text-slate-400 tracking-tight">No active reports for this jurisdiction</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics / Detail View */}
        <div className="glass-panel rounded-[3rem] shadow-2xl p-10 flex flex-col bg-white/70 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
          
          {selectedReport ? (
            <div className="animate-fade-in h-full flex flex-col relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Analysis</h2>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-900 w-10 h-10 bg-slate-100/50 rounded-xl flex items-center justify-center transition-all">
                  <Icon icon="lucide:x" className="text-xl"></Icon>
                </button>
              </div>
              <div className="space-y-8 flex-grow">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Subject Node</p>
                  <p className="font-black text-slate-900 text-lg leading-tight tracking-tight"><span className="text-indigo-600 font-mono text-base mr-2">{selectedReport.id}</span> {selectedReport.title}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Geo Tag</p>
                  <p className="font-bold text-slate-700 flex items-center gap-2"><Icon icon="lucide:map-pin" className="text-indigo-500 text-xl"></Icon> {selectedReport.area}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Incident Log</p>
                  <div className="text-slate-600 bg-white/80 p-5 rounded-[1.5rem] border border-slate-100 text-sm leading-relaxed font-medium shadow-inner">
                    {selectedReport.desc}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Evidence Data</p>
                  {selectedReport.proofImages && selectedReport.proofImages.length > 0 ? (
                    <div className="w-full h-40 rounded-[2rem] overflow-hidden border border-slate-100 relative shadow-inner">
                      {selectedReport.proofImages[0].startsWith('data:application/pdf') ? (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                            <Icon icon="lucide:file-text" className="text-4xl text-indigo-500 mb-2"></Icon>
                            <p className="text-slate-900 text-xs font-bold">Document attached</p>
                         </div>
                       ) : (
                         <img 
                           src={selectedReport.proofImages[0]} 
                           alt="Evidence" 
                           className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-500" 
                           onClick={() => { setModalImage(selectedReport.proofImages[0]); setIsModalOpen(true); }}
                         />
                       )}
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 group overflow-hidden relative shadow-inner">
                      <Icon icon="lucide:image" className="text-5xl text-slate-200 group-hover:scale-110 transition-transform duration-700"></Icon>
                      <p className="text-slate-400 font-bold text-sm absolute mt-16">No Evidence</p>
                      <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors"></div>
                    </div>
                  )}
                </div>
 
                {/* Resolution Proof Section (Visible when in Action Taken or Resolved status) */}
                {(selectedReport.status === "Action Taken" || selectedReport.status === "Resolved") && (
                  <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 space-y-4 animate-fade-in">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Resolution Details Required</p>
                    <textarea 
                      placeholder="Explain how the issue was resolved..."
                      value={resDesc}
                      onChange={(e) => setResDesc(e.target.value)}
                      className="w-full bg-white border border-indigo-100 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none h-24 resize-none"
                    />
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer group">
                        <input type="file" className="hidden" onChange={handleResFileChange} />
                        <div className="bg-white border border-indigo-100 rounded-xl p-3 flex items-center justify-center gap-2 group-hover:bg-indigo-50 transition-colors">
                          <Icon icon="lucide:upload" className="text-indigo-600" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest truncate">
                            {resFile ? "Proof Uploaded" : isProcessingRes ? "Processing..." : "Upload Resolution Proof"}
                          </span>
                        </div>
                      </label>
                      {resFile && (
                         <div className="w-10 h-10 rounded-lg overflow-hidden border border-indigo-200">
                           {resFile.startsWith('data:application/pdf') ? (
                              <div className="w-full h-full flex items-center justify-center bg-white"><Icon icon="lucide:file-text" className="text-indigo-600" /></div>
                           ) : (
                              <img src={resFile} className="w-full h-full object-cover" />
                           )}
                         </div>
                      )}
                    </div>
                  </div>
                )}
 
                 <div className="flex gap-4 pt-4">
                   <button 
                     onClick={handleReject}
                     disabled={selectedReport.status === "Resolved" || selectedReport.status === "Rejected"}
                     className="flex-1 py-5 bg-white border-2 border-red-200 text-red-600 font-black rounded-2xl hover:bg-red-50 transition-all tracking-widest text-xs disabled:opacity-30 active:scale-95"
                   >
                     REJECT
                   </button>
                   {selectedReport.status === "Resolved" ? (
                     <button 
                       onClick={handleUpdateResolution}
                       className="flex-[2] py-5 premium-button text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 tracking-widest text-xs active:scale-95"
                     >
                       UPDATE RESOLUTION PROOF
                     </button>
                   ) : (
                     <button 
                       onClick={handleUpdateStatus}
                       disabled={selectedReport.status === "Rejected"}
                       className="flex-[2] py-5 premium-button text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 tracking-widest text-xs disabled:opacity-30 active:scale-95"
                     >
                       {selectedReport.status === "Resolved" ? "RESOLVED" : "EXECUTE UPDATE"}
                     </button>
                   )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col relative z-10">
              <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Locality Insight</h2>
              
              <div className="space-y-8 flex-grow">
                {localityInsights.length > 0 ? (
                  localityInsights.map(item => (
                    <div key={item.name} className="group">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                        <span className="text-slate-500 group-hover:text-indigo-600 transition-colors line-clamp-1 pr-4">{item.name}</span>
                        <span className="text-slate-900">{item.value}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-[1.5s] ease-out`} style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                      <Icon icon="lucide:map" className="text-3xl text-slate-200"></Icon>
                    </div>
                    <p className="text-slate-400 font-bold tracking-tight">No regional data available yet.</p>
                  </div>
                )}
              </div>

              {localityInsights.length > 0 && (
                <div className="mt-12 p-6 bg-amber-500 text-white rounded-[2rem] shadow-xl shadow-amber-500/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                    <div className="flex gap-5 relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                          <Icon icon="lucide:zap" className="text-2xl text-white"></Icon>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-1">Critical Insight</p>
                            <p className="text-sm font-bold leading-snug">High volume surge detected in {localityInsights[0].name.split(',')[0]} sector.</p>
                        </div>
                    </div>
                </div>
              )}

              {filteredReports.length === 0 && (
                <div className="mt-12 p-6 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="flex gap-5 relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <Icon icon="lucide:info" className="text-2xl text-white"></Icon>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Status Report</p>
                            <p className="text-sm font-bold leading-snug">No active cases registered for this department.</p>
                        </div>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Image Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-fade-in p-10"
          onClick={() => setIsModalOpen(false)}
        >
          <button 
            className="absolute top-10 left-10 z-[250] flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black text-xs uppercase tracking-[0.2em] rounded-full border border-white/20 transition-all group shadow-2xl active:scale-95"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
          >
            <Icon icon="lucide:arrow-left" className="text-xl group-hover:-translate-x-1 transition-transform"></Icon> BACK TO DASHBOARD
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img 
              src={modalImage} 
              alt="Full Preview" 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl shadow-black/50" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

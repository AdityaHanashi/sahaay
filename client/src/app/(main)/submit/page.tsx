"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { generateComplaintId, getDepartmentPrefix } from "@/lib/generateId";
import { useVoice } from "@/context/VoiceContext";

const ISSUE_MAP: Record<string, string[]> = {
  "Law Enforcement & Cybercrime (A)": [
    "Online Fraud", "Identity Theft", "Phishing Scam", "Hacking", "OTP Fraud", 
    "Cyber Stalking", "Social Media Scam", "Fake Website / App Fraud", "UPI Fraud", 
    "Financial Scam", "Other"
  ],
  "Income Tax (B)": [
    "Tax Evasion", "Undisclosed Income", "Fake Billing", "GST Fraud", "Black Money", 
    "Illegal Transactions", "Shell Companies", "TDS Issues", "Refund Delay", 
    "PAN Misuse", "Other"
  ],
  "Municipal (C)": [
    "Potholes", "Garbage Collection Delay", "Streetlights Not Working", "Water Leakage", 
    "Drainage Overflow", "Road Damage", "Illegal Construction", "Sewage Issue", 
    "Public Sanitation Issue", "Noise Complaint", "Other"
  ],
  "Social Welfare (D)": [
    "Pension Not Received", "Ration Not Provided / Denied", "Ration Quantity Less / Corruption", 
    "Scheme Benefits Not Received", "Delay in Government Benefits", 
    "Aadhaar Not Linked / Verification Failed", "Wrong Beneficiary / Name Missing", 
    "Subsidy Not Credited", "Child Abuse", "Domestic Violence", "Other"
  ]
};

const DEPARTMENTS = [
  { id: "A", name: "Law Enforcement & Cybercrime (A)", icon: "lucide:shield", image: "/law-enforcement.png", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  { id: "B", name: "Income Tax (B)", icon: "lucide:landmark", image: "/income-tax.png", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "C", name: "Municipal (C)", icon: "lucide:building-2", image: "/municipal.png", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
   { id: "D", name: "Social Welfare (D)", icon: "lucide:users", image: "/social-welfare.png", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" }
 ];

export default function SubmitReportPage() {
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState("");
  const [issue, setIssue] = useState("");
  const [otherIssue, setOtherIssue] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [area, setArea] = useState("Detecting...");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isManualArea, setIsManualArea] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showSkipProof, setShowSkipProof] = useState(false);
  const [apiError, setApiError] = useState("");
  
  // Role State
  const [userRole, setUserRole] = useState("");
  const [tempRole, setTempRole] = useState("Citizen");
  const [otherRoleText, setOtherRoleText] = useState("");
  const [showRolePrompt, setShowRolePrompt] = useState(false);
  
  // Location Consent States
  const [showLocationConsent, setShowLocationConsent] = useState(false);
  const [locationData, setLocationData] = useState<{lat: number, lng: number, address: string, source: string} | null>(null);
  const [consentMessage, setConsentMessage] = useState("");

  const isPrivacyDept = department && (
    department.includes("Income Tax") || 
    department.includes("Municipal") || 
    department.includes("Social Welfare")
  );

  const { aiData, setAiData } = useVoice();

  useEffect(() => {
    if (aiData) {
      setDepartment(aiData.department);
      
      const allIssues = Object.values(ISSUE_MAP).flat();
      if (allIssues.includes(aiData.issueTitle)) {
        setIssue(aiData.issueTitle);
      } else {
        setIssue("Other");
        setOtherIssue(aiData.issueTitle);
      }
      
      setDesc(aiData.description);
      setStep(3); // Fast forward to Upload Proof
      
      setAiData(null); // Clear data so it doesn't trigger again
    }
  }, [aiData, setAiData]);

  useEffect(() => {
    // Google Maps Script is now loaded in root layout
    setIsScriptLoaded(true);
  }, []);

  useEffect(() => {
    const savedRole = localStorage.getItem("sahaay_user_role");
    if (savedRole && savedRole.trim() !== "" && savedRole !== "Other") {
      setUserRole(savedRole);
      setShowRolePrompt(false);
    } else {
      setShowRolePrompt(true);
    }
  }, []);

  useEffect(() => {
    if (step === 5) {
      if (!isPrivacyDept) {
        detectLocation();
      } else {
        // For privacy depts, we wait for manual entry or plane icon click
        setIsManualArea(true); 
        if (area === "Detecting...") {
          setArea("");
        }
      }
    }
  }, [step, isPrivacyDept]);

  const detectLocation = async (hasConsented = false) => {
    setIsDetecting(true);
    const result = await getGeolocation();
    setArea(result);
    setIsDetecting(false);
    
    // If we have coordinates, we could store them in locationData here
    // but the getGeolocation helper currently only returns the address string.
    // Let's refine getGeolocation to also return coords if possible.
  };

  const handlePlaneClick = () => {
    setShowLocationConsent(true);
  };

  const handleConsentYes = async () => {
    setShowLocationConsent(false);
    setIsDetecting(true);
    
    if (!navigator.geolocation) {
      setArea("Geolocation not supported");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Use high-precision coordinates directly
        const coordinateString = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        
        console.log("Precise location captured:", coordinateString);
        setArea(coordinateString);
        setSearchQuery(coordinateString);
        setLocationData({ lat, lng, address: coordinateString, source: "precise-consented" });
        setIsDetecting(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setConsentMessage("Location access failed. Please enter manually.");
        setIsDetecting(false);
      },
      { 
        timeout: 10000, 
        enableHighAccuracy: true, 
        maximumAge: 0 
      }
    );
  };

  const handleConsentNo = () => {
    setShowLocationConsent(false);
    setConsentMessage("Please enter the issue location manually");
  };

  const handleSaveRole = () => {
    const finalRole = tempRole === "Other" ? otherRoleText : tempRole;
    if (!finalRole || finalRole.trim() === "") return;
    
    localStorage.setItem("sahaay_user_role", finalRole);
    setUserRole(finalRole);
    setShowRolePrompt(false);
  };

  const handleDepartmentSelect = (deptName: string) => {
    setDepartment(deptName);
    setIssue(""); // Reset issue when changing department
    setOtherIssue("");
  };

  const handleIssueSelect = (selectedIssue: string) => {
    setIssue(selectedIssue);
    if (selectedIssue !== "Other") {
      setOtherIssue("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      
      // Cleanup old previews to avoid memory leaks
      previews.forEach(url => URL.revokeObjectURL(url));
      
      const newPreviews = selectedFiles
        .filter(file => file.type.startsWith('image/'))
        .map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3 || !(window as any).google || !isScriptLoaded) {
      setSuggestions([]);
      return;
    }
    
    try {
      const service = new (window as any).google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: query, types: ["(regions)"] },
        (predictions: any, status: any) => {
          if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setApiError("");
          } else if (status === "REQUEST_DENIED") {
            setApiError("Places API not enabled in Google Cloud Console.");
            setSuggestions([]);
          } else {
            setSuggestions([]);
          }
        }
      );
    } catch (err) {
      console.error("Autocomplete service error:", err);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setArea(suggestion.description);
    setSearchQuery(suggestion.description);
    setSuggestions([]);
  };

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

          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          console.log("Image compressed");
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        console.log("File processed");
        resolve(reader.result as string);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const getGeolocation = async (): Promise<string> => {
    return new Promise((resolve) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showRolePrompt) return; 

    if (step < 5) {
      setStep(step + 1);
      return;
    }
    
    console.log("Submit started");
    setIsSubmitting(true);
    
    try {
      // 1. Determine Area (Use existing state if valid, otherwise wait or fallback)
      let currentArea = area;
      
      if (area.includes("Detecting") || area.includes("error") || area.includes("denied")) {
        console.log("Area invalid, attempting quick fetch...");
        currentArea = await Promise.race([
          getGeolocation(),
          new Promise<string>((resolve) => setTimeout(() => resolve("Unknown Area"), 3000))
        ]);
      }

      // 2. Process files (Base64 + Compression)
      let proofImages: string[] = [];
      try {
        if (files.length > 0) {
          const imageFiles = files.filter(f => f.type.startsWith('image/'));
          if (imageFiles.length > 2) {
            alert("Maximum 2 images allowed for faster processing");
          }
          
          const filesToProcess = files.slice(0, 5); // Safety limit for total files
          let imagesProcessed = 0;

          for (const file of filesToProcess) {
            if (file.type.startsWith('image/') && imagesProcessed < 2) {
              const base64 = await compressImage(file);
              proofImages.push(base64);
              imagesProcessed++;
            } else if (file.type === 'application/pdf') {
              if (file.size <= 500 * 1024) {
                const base64 = await fileToBase64(file);
                proofImages.push(base64);
              } else {
                console.log("PDF too large, skipping");
              }
            }
          }
        }
      } catch (fileErr) {
        console.error("File processing error:", fileErr);
        // Continue submission even if files fail
      }

      // 3. Generate ID (Immediate)
      const newId = generateComplaintId(department);
      const prefix = getDepartmentPrefix(department);

      // 4. Save to Firestore
      console.log("Saving to DB");
      await addDoc(collection(db, "complaints"), {
        complaintId: newId,
        department,
        prefix,
        issueTitle: issue === "Other" ? otherIssue : issue,
        description: desc,
        area: currentArea || "Unknown Area", 
        role: userRole,
        proofImages,
        status: "Submitted",
        agreeCount: 0,
        disagreeCount: 0,
        createdAt: serverTimestamp(),
        createdVia: department.includes("Call Assistant") ? "call" : "manual",
        locationMetadata: locationData
      });

      console.log("Submit success");

      setComplaintId(newId);
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
      console.log("Submit completed");
    }
  };

  if (complaintId) {
    return (
      <div className="max-w-2xl mx-auto text-center pt-10">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-fade-in-up">
          <Icon icon="lucide:check-circle" className="text-5xl"></Icon>
        </div>
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight mb-4 animate-fade-in-up" style={{animationDelay: "0.1s"}}>Report Submitted Successfully</h1>
        <p className="text-xl text-slate-600 mb-10 animate-fade-in-up" style={{animationDelay: "0.2s"}}>Your complaint has been securely logged.</p>
        
        <div className="glass-panel p-10 rounded-[2.5rem] inline-block mb-12 animate-fade-in-up shadow-2xl" style={{animationDelay: "0.3s"}}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Complaint ID</p>
          <p className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 tracking-wider">{complaintId}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in-up" style={{animationDelay: "0.4s"}}>

          <Link href="/track" className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-md">
            Track Status
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 animate-fade-in-up">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Submit a Report</h1>
          <p className="text-slate-500 mt-3 text-xl">Follow the steps below to securely log your complaint.</p>
        </div>
        {userRole && (
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-50/50 backdrop-blur-sm text-indigo-700 font-bold rounded-2xl border border-indigo-100 shadow-sm">
              <Icon icon="lucide:user" className="text-xl"></Icon>
              Role: {userRole}
            </span>
          </div>
        )}
      </div>
      
      {/* Role Selection Section (If missing) */}
      {showRolePrompt && (
        <div className="glass-panel p-10 rounded-[2.5rem] mb-16 border-indigo-200 bg-indigo-50/20 animate-fade-in-up">
           <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-3">
             <Icon icon="lucide:user-check" className="text-indigo-600"></Icon>
             Please identify yourself
           </h2>
           <p className="text-slate-600 mb-8 text-base leading-relaxed">We need to know your role to process the complaint correctly and ensure appropriate handling.</p>
           
           <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="relative w-full sm:w-72">
                <select 
                  value={tempRole}
                  onChange={(e) => setTempRole(e.target.value)}
                  className="appearance-none w-full bg-white border border-slate-200 text-slate-900 py-4 px-5 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold cursor-pointer premium-input"
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Student">Student</option>
                  <option value="Officer">Officer</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Icon icon="lucide:chevron-down" className="text-xl"></Icon>
                </div>
              </div>

              {tempRole === "Other" && (
                <div className="w-full sm:flex-1 animate-fade-in">
                  <input 
                    type="text"
                    maxLength={20}
                    value={otherRoleText}
                    onChange={(e) => setOtherRoleText(e.target.value)}
                    placeholder="Enter your role"
                    className="w-full bg-white border border-slate-200 text-slate-900 py-4 px-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold premium-input"
                  />
                </div>
              )}

              <button 
                onClick={handleSaveRole}
                disabled={tempRole === "Other" && !otherRoleText.trim()}
                className="w-full sm:w-auto px-10 py-4 premium-button text-white font-bold rounded-2xl disabled:opacity-50 shadow-lg"
              >
                Save Role
              </button>
           </div>
        </div>
      )}

      {/* Main Form Flow (Disabled if role not selected) */}
      <div className={`transition-all duration-700 ${showRolePrompt ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
        {/* Progress Bar */}
        <div className="flex gap-3 mb-16 px-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex-1 h-2 relative rounded-full bg-slate-100 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-in-out ${step >= s ? 'w-full' : 'w-0'}`}></div>
            </div>
          ))}
        </div>

        <div className="glass-panel p-10 md:p-16 rounded-[3rem] relative overflow-hidden bg-white/40">
          <form onSubmit={handleSubmit} className="relative z-10 space-y-16">
            
            {/* STEP 1: Department */}
            <div className={`transition-all duration-500 ease-out ${step > 1 ? 'opacity-40 blur-[1px] pointer-events-none hidden md:block' : ''}`}>
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base font-black shadow-sm">1</span>
                Select Department
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-stagger">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentSelect(dept.name)}
                    className={`group flex items-center gap-5 p-6 rounded-[2rem] border-2 text-left transition-all duration-500 ease-out hover:scale-[1.02] stagger-child ${
                      department === dept.name 
                        ? `border-indigo-500 bg-white shadow-xl shadow-indigo-500/10` 
                        : `bg-white/50 border-slate-100 hover:border-indigo-200 hover:bg-white`
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:rotate-6 transition-transform ${dept.bg} ${dept.color}`}>
                      {dept.image ? (
                        <img src={dept.image} alt={dept.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Icon icon={dept.icon} className="text-3xl"></Icon>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 text-xl tracking-tight">{dept.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2: Issue (Dynamic based on Department) */}
            {department && (
              <div key={department} className={`animate-fade-in-up transition-all duration-500 ease-out ${step > 2 ? 'opacity-40 blur-[1px] pointer-events-none hidden md:block' : ''}`}>
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base font-black shadow-sm">2</span>
                  What is the issue?
                </h2>
                <div className="flex flex-wrap gap-4">
                  {ISSUE_MAP[department]?.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleIssueSelect(item)}
                      className={`px-7 py-3.5 rounded-[1.25rem] font-bold transition-all duration-300 ease-out border-2 ${
                        issue === item 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/30' 
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* Conditional "Other" Input */}
                {issue === "Other" && (
                  <div className="mt-8 animate-fade-in-up">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Detailed Category (Max 15 chars)</label>
                    <input 
                      type="text" 
                      maxLength={15}
                      value={otherIssue}
                      onChange={(e) => setOtherIssue(e.target.value)}
                      placeholder="Briefly describe..."
                      className="w-full md:w-2/3 bg-white border border-slate-200 text-slate-900 py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold premium-input shadow-sm"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-2.5 px-1 font-medium italic">{15 - otherIssue.length} characters remaining</p>
                  </div>
                )}
              </div>
            )}

            {/* Additional steps */}
            {step >= 3 && (
              <div className={`animate-fade-in-up transition-all duration-500 ease-out ${step > 3 ? 'opacity-40 blur-[1px] pointer-events-none hidden md:block' : ''}`}>
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base font-black shadow-sm">3</span>
                  Upload Proof (Optional)
                </h2>
                <label className="block border-3 border-dashed border-slate-200 bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all duration-500 cursor-pointer group">
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  {previews.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      {previews.map((url, i) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md relative group/preview">
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Icon icon="lucide:upload-cloud" className="text-3xl text-indigo-600"></Icon>
                    </div>
                  )}
                  <p className="font-bold text-slate-900 text-xl tracking-tight">
                    {files.length > 0 ? `${files.length} file(s) selected` : 'Drop evidence files here or click to browse'}
                  </p>
                  <p className="text-slate-400 mt-2 font-medium">Images, Audio, or Videos (Max 50MB)</p>
                </label>
              </div>
            )}

            {/* STEP 4: Description */}
            {step >= 4 && (
              <div className={`animate-fade-in-up transition-all duration-500 ease-out ${step > 4 ? 'opacity-40 blur-[1px] pointer-events-none hidden md:block' : ''}`}>
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base font-black shadow-sm">4</span>
                  Description
                </h2>
                <textarea 
                  rows={5} 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain the situation clearly (Optional)..." 
                  className="w-full bg-white border border-slate-200 text-slate-900 py-5 px-6 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold premium-input shadow-sm resize-none"
                ></textarea>
              </div>
            )}

            {/* STEP 5: Location */}
            {step >= 5 && (
              <div className={`animate-fade-in-up transition-all duration-500 ease-out`}>
                <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base font-black shadow-sm">5</span>
                  Location Detection
                </h2>
                
                {isPrivacyDept ? (
                  <div className="space-y-6">
                    <div className="bg-white/80 border border-slate-100 p-8 rounded-[2.5rem] shadow-lg animate-fade-in relative z-50">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Location of Issue</label>
                      <div className="flex flex-col sm:flex-row gap-4 relative">
                        <div className="flex-grow relative">
                          <input 
                            type="text" 
                            value={area}
                            onChange={(e) => { 
                              setArea(e.target.value);
                              setSearchQuery(e.target.value); 
                              fetchSuggestions(e.target.value);
                            }}
                            placeholder="Enter the location of the issue..."
                            className={`w-full bg-white border ${apiError ? 'border-red-300' : 'border-slate-200'} text-slate-900 py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold premium-input`}
                          />
                          {apiError && <p className="text-[10px] text-red-500 mt-1 font-bold px-1">⚠️ {apiError}</p>}
                          {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-fade-in">
                              {suggestions.map((s, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleSuggestionClick(s)}
                                  className="w-full text-left px-6 py-4 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                                >
                                  <p className="font-bold text-slate-900 text-sm">{s.structured_formatting.main_text}</p>
                                  <p className="text-slate-500 text-xs">{s.structured_formatting.secondary_text}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          type="button"
                          onClick={handlePlaneClick}
                          disabled={isDetecting}
                          className={`px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl transition-all h-fit shadow-lg shadow-indigo-500/20 ${isDetecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                        >
                          {isDetecting ? (
                            <Icon icon="lucide:loader-2" className="animate-spin text-2xl" />
                          ) : (
                            "✈️"
                          )}
                        </button>
                      </div>
                      {consentMessage && (
                        <p className="text-sm text-indigo-600 font-bold mt-4 px-1 animate-fade-in">
                          {consentMessage}
                        </p>
                      )}
                    </div>

                    {/* Consent Popup */}
                    {showLocationConsent && (
                      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                        <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-white/20 animate-scale-in">
                          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-8 mx-auto">
                            <Icon icon="lucide:map-pin" className="text-4xl" />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 text-center mb-4 leading-tight">Location Access</h3>
                          <p className="text-slate-600 text-center mb-10 font-medium leading-relaxed">
                            Are you comfortable sharing the exact issue location with admin? This helps us resolve your complaint with higher precision.
                          </p>
                          <div className="flex gap-4">
                            <button 
                              onClick={handleConsentNo}
                              className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                            >
                              No
                            </button>
                            <button 
                              onClick={handleConsentYes}
                              className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : isManualArea ? (
                  <div className="bg-white/80 border border-slate-100 p-8 rounded-[2.5rem] shadow-lg animate-fade-in relative z-50">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Search Your Area</label>
                    <div className="flex flex-col sm:flex-row gap-4 relative">
                      <div className="flex-grow relative">
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => { 
                            setSearchQuery(e.target.value); 
                            fetchSuggestions(e.target.value);
                            setArea(e.target.value); 
                          }}
                          placeholder="Start typing your area (e.g. Koramangala...)"
                          className={`w-full bg-white border ${apiError ? 'border-red-300' : 'border-slate-200'} text-slate-900 py-4 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold premium-input`}
                        />
                        {apiError && <p className="text-[10px] text-red-500 mt-1 font-bold px-1">⚠️ {apiError}</p>}
                        {suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-fade-in">
                            {suggestions.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleSuggestionClick(s)}
                                className="w-full text-left px-6 py-4 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                              >
                                <p className="font-bold text-slate-900 text-sm">{s.structured_formatting.main_text}</p>
                                <p className="text-slate-500 text-xs">{s.structured_formatting.secondary_text}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => { setIsManualArea(false); detectLocation(); }}
                        className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all h-fit"
                      >
                        Auto-detect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/80 border border-slate-100 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-indigo-500/5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        {isDetecting ? (
                          <Icon icon="lucide:loader-2" className="text-2xl animate-spin"></Icon>
                        ) : (
                          <Icon icon="lucide:map-pin" className="text-2xl animate-pulse"></Icon>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xl tracking-tight">
                          {isDetecting ? 'Detecting Location...' : area}
                        </p>
                        <p className="text-slate-500 font-medium">This area will be attached to your report.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={detectLocation}
                        className="px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                      >
                        <Icon icon="lucide:refresh-cw" className={`text-lg ${isDetecting ? 'animate-spin' : ''}`}></Icon> 
                        {isDetecting ? 'Refreshing...' : 'Redetect'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setIsManualArea(true); if(area.includes("Detecting") || area.includes("error") || area.includes("denied")) setArea(""); }}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                      >
                        <Icon icon="lucide:pencil" className="text-lg"></Icon> Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
              {showSkipProof && isSubmitting === false && (
                <p className="text-sm text-red-500 font-bold mr-auto">Upload failed. You may proceed without proof.</p>
              )}
              
              {showSkipProof && (
                <button 
                  type="button"
                  onClick={() => { setShowSkipProof(true); handleSubmit(new Event('submit') as any); }}
                  className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Submit without Proof
                </button>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || isDetecting || !department || (!issue && step === 2)}
                className="premium-button px-12 py-5 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3">
                    <Icon icon="lucide:loader-2" className="animate-spin"></Icon>
                    Processing...
                  </span>
                ) : isDetecting ? (
                  <span className="flex items-center gap-3">
                    <Icon icon="lucide:loader-2" className="animate-spin"></Icon>
                    Waiting for Location...
                  </span>
                ) : step === 5 ? 'Finalize Submission' : 'Continue to Next Step'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

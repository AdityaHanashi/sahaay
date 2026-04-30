export function generateComplaintId(departmentName) {
  const departmentMap = {
    "Law Enforcement & Cybercrime (A)": "A",
    "Income Tax (B)": "B",
    "Municipal (C)": "C",
    "Social Welfare (D)": "D",
    "Call Assistant Reports (E)": "E"
  };

  const prefix = departmentMap[departmentName] || "X";
  
  // Pattern: A1 -> A99, then A1a1, A2a1...
  // We'll randomize the selection within the pattern as requested
  const n = Math.floor(Math.random() * 99) + 1; // 1-99
  
  // Randomly decide if we are in a later "cycle" (suffix)
  // 0 = no suffix (first cycle), 1-9 = a1, a2...
  const cycle = Math.floor(Math.random() * 10); 
  const suffix = cycle === 0 ? "" : `a${cycle}`;
  
  const id = `${prefix}${n}${suffix}`;
  console.log("Generated Pattern ID:", id);
  return id;
}

export function getDepartmentPrefix(departmentName) {
  const departmentMap = {
    "Law Enforcement & Cybercrime (A)": "A",
    "Income Tax (B)": "B",
    "Municipal (C)": "C",
    "Social Welfare (D)": "D",
    "Call Assistant Reports (E)": "E"
  };
  return departmentMap[departmentName] || "X";
}

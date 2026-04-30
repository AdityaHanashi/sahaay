import React from "react";
import { Icon } from "@iconify/react";

export default function ContactSupportButton() {
  return (
    <div className="text-slate-600 font-medium flex flex-col sm:flex-row sm:items-center gap-1 group text-left">
      Contact Us: <span className="text-indigo-600 font-bold flex items-center gap-2 group-hover:underline"><Icon icon="lucide:phone-call" /> +91-800-123-4567</span>
    </div>
  );
}

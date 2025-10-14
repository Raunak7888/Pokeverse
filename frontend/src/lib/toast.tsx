import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import React from "react";

const baseStyle = {
  className: "rounded-xl shadow-lg border border-transparent px-4 py-3 w-100 h-12 font-medium text-sm",
};

export const customToast = {
  success: (message: string) =>
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 bg-green-600 text-white ${baseStyle.className}`}
        onClick={() => toast.dismiss(t)}
      >
        <CheckCircle2 className="w-5 h-5" />
        <span>{message}</span>
      </div>
    )),

  error: (message: string) =>
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 bg-red-600 text-white ${baseStyle.className}`}
        onClick={() => toast.dismiss(t)}
      >
        <XCircle className="w-5 h-5" />
        <span>{message}</span>
      </div>
    )),

  warning: (message: string) =>
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 bg-yellow-500 text-black ${baseStyle.className}`}
        onClick={() => toast.dismiss(t)}
      >
        <AlertTriangle className="w-5 h-5" />
        <span>{message}</span>
      </div>
    )),

  info: (message: string) =>
    toast.custom((t) => (
      <div
        className={`flex items-center gap-3 bg-blue-600 text-white ${baseStyle.className}`}
        onClick={() => toast.dismiss(t)}
      >
        <Info className="w-5 h-5" />
        <span>{message}</span>
      </div>
    )),
};

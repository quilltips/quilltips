
import { PenSquare } from "lucide-react";

interface UnsavedChangesIndicatorProps {
  show: boolean;
}

export const UnsavedChangesIndicator = ({ show }: UnsavedChangesIndicatorProps) => {
  if (!show) return null;
  
  return (
    <div className="absolute -top-4 right-0 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-md border border-amber-200 flex items-center gap-2 animate-pulse-slow">
      <PenSquare className="h-4 w-4" />
      <span className="text-sm font-medium">Unsaved changes</span>
    </div>
  );
};

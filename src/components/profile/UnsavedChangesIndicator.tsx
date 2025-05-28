
import { PenSquare } from "lucide-react";

interface UnsavedChangesIndicatorProps {
  show: boolean;
}

export const UnsavedChangesIndicator = ({ show }: UnsavedChangesIndicatorProps) => {
  if (!show) return null;
  
  return (
    <div className="absolute -top-6 right-0 bg-[#19363C] text-[#FFD166] px-3 py-1 rounded-md border border-amber-200 flex items-center gap-2 ">
      <span className="text-sm font-medium">Unsaved changes</span>
    </div>
  );
};

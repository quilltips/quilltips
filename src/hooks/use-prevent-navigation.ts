
import { useEffect } from "react";

/**
 * Hook to prevent navigation when there are unsaved changes
 * @param hasUnsavedChanges Boolean indicating if there are unsaved changes
 */
export function usePreventNavigation(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard way to show a confirmation dialog
        event.preventDefault();
        // This message may not be displayed in some browsers due to security constraints
        event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}

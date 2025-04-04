
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { routes } from "@/routes/routes";
import { useEffect } from "react";

function App() {
  const location = useLocation();

  // Ensure scroll to top behavior for direct route changes not wrapped in Layout
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;

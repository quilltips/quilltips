
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { routes } from "@/routes/routes";

function App() {
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

// src/App.tsx

import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { routes } from "@/routes/routes";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";

function App() {
  const location = useLocation();

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <Routes>
        {routes.map((route) => {
          if (route.element) {
            // Special case like <Navigate />
            return (
              <Route key={route.path} path={route.path} element={route.element} />
            );
          }

          const Component = route.component;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Layout>
                  <Component />
                </Layout>
              }
            />
          );
        })}
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;

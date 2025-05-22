
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
    <div className="font-lato text-[#33333]">
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
          
          // Index page doesn't need Layout since it's included directly
          if (route.path === "/") {
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
          }

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
    </div>
  );
}

export default App;

import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import { ConfirmProvider } from "./components/ConfirmDialog";
import { GradeLevelProvider } from "./components/GradeLevelContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GradeLevelProvider>
          <ConfirmProvider>
            <RouterProvider router={router} />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                  padding: 0,
                },
              }}
            />
          </ConfirmProvider>
        </GradeLevelProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
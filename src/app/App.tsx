import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import { ConfirmProvider } from "./components/ConfirmDialog";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfirmProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: { fontSize: "13px" },
            }}
          />
        </ConfirmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./index.css";

console.log("Main.tsx loaded");

const container = document.getElementById("root");
if (container) {
  console.log("Root element found, rendering app");
  createRoot(container).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.error("Root element not found");
}

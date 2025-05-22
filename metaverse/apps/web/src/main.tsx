import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "@/components/ui/sonner";
import store from "./store";
import { Provider } from "react-redux";

createRoot(document.getElementById("root")!).render(
  <>
    <StrictMode>
    <Provider store={store}>
      <Toaster />
      <App />
    </Provider>
    </StrictMode>
  </>
);

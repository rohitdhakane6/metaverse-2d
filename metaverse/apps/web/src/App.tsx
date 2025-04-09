import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import Space from "./pages/Space";
import { ProtectedRoute } from "./util/ProtectedRoute";
import Register from "@/pages/Register";
import {Sfu} from "@/pages/Sfu";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes that redirect logged-in users */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected route that requires authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/space/:spaceId" element={<Space />} />
            <Route path="/sfu" element={<Sfu/>}/>
          </Route>

          {/* Catch-all: Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;

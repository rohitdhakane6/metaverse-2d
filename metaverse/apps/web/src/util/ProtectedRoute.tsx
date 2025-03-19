import { Outlet,Navigate } from "react-router-dom";

export const ProtectedRoute = () => {
    const user= localStorage.getItem("token");
    return user ? <Outlet /> : <Navigate to="/login" />
}


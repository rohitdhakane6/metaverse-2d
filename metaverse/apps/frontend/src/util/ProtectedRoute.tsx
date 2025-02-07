import { Outlet,Navigate } from "react-router-dom";

export const ProtectedRoute = () => {
    const user= null
    return user ? <Outlet /> : <Navigate to="/login" />
}


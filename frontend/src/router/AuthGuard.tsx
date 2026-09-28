import { Navigate, Outlet } from "react-router-dom"
import { ROUTES } from "./routes"

export function AuthGuard() {
  const token = localStorage.getItem("accessToken")
  return token ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
}

export function GuestGuard() {
  const token = localStorage.getItem("accessToken")
  return token ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />
}

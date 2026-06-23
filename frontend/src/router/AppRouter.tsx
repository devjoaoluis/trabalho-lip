import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import { ROUTES } from "./routes"
import { AuthGuard, GuestGuard } from "./AuthGuard"

const LoginPage            = lazy(() => import("#pages/LoginPage"))
const RegisterPage         = lazy(() => import("#pages/RegisterPage"))
const DashboardPage        = lazy(() => import("#pages/DashboardPage"))
const NotFoundPage         = lazy(() => import("#pages/NotFoundPage"))
const ForgotPasswordPage   = lazy(() => import("#pages/ForgotPasswordPage"))
const ResetPasswordPage    = lazy(() => import("#pages/ResetPasswordPage"))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0f1e]">
      <span className="text-white/50 text-sm">Carregando…</span>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rota raiz → redireciona para login */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

          {/* Rotas públicas — redireciona para dashboard se já autenticado */}
          <Route element={<GuestGuard />}>
            <Route path={ROUTES.LOGIN}            element={<LoginPage />} />
            <Route path={ROUTES.REGISTER}         element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD}  element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD}   element={<ResetPasswordPage />} />
          </Route>

          {/* Rotas protegidas — exige autenticação */}
          <Route element={<AuthGuard />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            {/* Adicione novas rotas autenticadas aqui */}
          </Route>

          {/* Fallback — rota não encontrada */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

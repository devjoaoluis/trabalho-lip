import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { useLogin } from "#hooks/useLogin"
import { ROUTES } from "../../router/routes"
import "./login.css"

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const { isLoading, error, submit } = useLogin()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submit({ email, password }, () => navigate(ROUTES.DASHBOARD, { replace: true }))
  }

  return (
    <div className="login-card-wrapper" aria-label="Área de login">
      {/* Sombra decorativa roxa */}
      <div className="login-card-wrapper__shadow" aria-hidden="true" />

      {/* Card principal */}
      <div className="login-card">
        <TaskLipLogo variant="dark" className="login-card__logo" />

        <header className="login-card__header">
          <h1 className="login-card__title">Acesso ao Quadro de Tarefas</h1>
          <p className="login-card__subtitle">Faça login para continuar</p>
        </header>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulário de login"
        >
          {/* Campo e-mail */}
          <div className="login-form__field">
            <Input
              id="login-email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-label="Seu email"
              className="login-form__input"
              disabled={isLoading}
            />
          </div>

          {/* Campo senha */}
          <div className="login-form__field login-form__field--password">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              aria-label="Sua senha"
              className="login-form__input login-form__input--password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="login-form__password-toggle hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <p
              className="text-sm text-red-500 -mt-1"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          {/* Esqueceu a senha */}
          <div className="login-form__forgot">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="login-form__forgot-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
            >
              Esqueceu a senha?
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="login-form__submit hover:bg-[#6a5fe0] active:bg-[#5c52cc] focus-visible:ring-[#7c6ff7]/50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export function LoginPage() {
  return (
    <main className="login-page flex-col lg:flex-row">
      {/* Coluna esquerda – hero */}
      <section
        className="login-page__hero flex-1 lg:px-16 lg:py-12"
        aria-label="Apresentação do produto"
      >
        <TaskLipLogo className="login-page__hero-logo mb-auto" />

        <div className="login-page__hero-content mt-16 lg:mt-0 lg:flex-1 lg:justify-center">
          <h2 className="login-page__headline sm:text-5xl lg:text-6xl xl:text-7xl">
            Gerencie suas<br />Tarefas
          </h2>

          <p className="login-page__cta">
            Ainda não possui acesso?{" "}
            <Link
              to={ROUTES.REGISTER}
              className="login-page__cta-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
            >
              Criar Conta
            </Link>
          </p>
        </div>
      </section>

      {/* Coluna direita – formulário */}
      <aside
        className="login-page__form-col w-full lg:w-[55%]"
        aria-label="Formulário de acesso"
      >
        <LoginForm />
      </aside>
    </main>
  )
}

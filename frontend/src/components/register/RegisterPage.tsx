import { useState } from "react"
import { Eye, EyeOff, CheckCircle2, Circle, Info } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { cn } from "#lib/utils"
import { useRegister } from "#hooks/useRegister"
import { ROUTES } from "../../router/routes"
import "./register.css"

interface PasswordRule {
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  {
    label: "Pelo menos um caractere especial (@#$%)",
    test: (pw) => /[@#$%!^&*]/.test(pw),
  },
  {
    label: "Pelo menos uma letra maiúscula",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: "No mínimo 8 caracteres",
    test: (pw) => pw.length >= 8,
  },
]

function PasswordHints({ password }: { password: string }) {
  return (
    <ul className="register-form__password-hints" aria-label="Requisitos de senha">
      {PASSWORD_RULES.map((rule) => {
        const valid = rule.test(password)
        const Icon = valid ? CheckCircle2 : password.length === 0 ? Info : Circle
        return (
          <li
            key={rule.label}
            className={cn(
              "register-form__hint",
              valid && "register-form__hint--valid"
            )}
          >
            <Icon
              size={13}
              className="register-form__hint-icon"
              aria-hidden="true"
            />
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()
  const { isLoading, error, submit } = useRegister()

  const allRulesValid = PASSWORD_RULES.every((r) => r.test(password))
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!allRulesValid) return
    if (!passwordsMatch) return
    if (!agreedToTerms) return

    await submit(
      { nome, email, password },
      () => navigate(ROUTES.LOGIN, { replace: true, state: { registered: true } })
    )
  }

  return (
    <div className="register-card-wrapper" aria-label="Área de cadastro">
      {/* Sombra decorativa roxa */}
      <div className="register-card-wrapper__shadow" aria-hidden="true" />

      {/* Card principal */}
      <div className="register-card">
        <TaskLipLogo variant="dark" className="register-card__logo" />

        <header className="register-card__header">
          <h1 className="register-card__title">Conheça o Quadro de Tarefas</h1>
          <p className="register-card__subtitle">Faça seu cadastro</p>
        </header>

        <form
          className="register-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulário de cadastro"
        >
          {/* Campo nome */}
          <div className="register-form__field">
            <Input
              id="register-nome"
              type="text"
              placeholder="Nome de usuário"
              value={nome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNome(e.target.value)
              }
              autoComplete="name"
              required
              aria-label="Nome de usuário"
              className="register-form__input"
              disabled={isLoading}
            />
          </div>

          {/* Campo e-mail */}
          <div className="register-form__field">
            <Input
              id="register-email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
              aria-label="Seu email"
              className="register-form__input"
              disabled={isLoading}
            />
          </div>

          {/* Campo senha */}
          <div className="register-form__field register-form__field--password">
            <Input
              id="register-senha"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              autoComplete="new-password"
              required
              aria-label="Sua senha"
              aria-describedby="register-password-hints"
              className="register-form__input register-form__input--password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="register-form__password-toggle hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
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

          {/* Hints de validação */}
          {password.length > 0 && (
            <div id="register-password-hints">
              <PasswordHints password={password} />
            </div>
          )}

          {/* Campo confirmação de password */}
          <div className="register-form__field register-form__field--password">
            <Input
              id="register-confirm-senha"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmação da senha"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              autoComplete="new-password"
              required
              aria-label="Confirmação da senha"
              aria-invalid={
                confirmPassword.length > 0 && !passwordsMatch ? true : undefined
              }
              className="register-form__input register-form__input--password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="register-form__password-toggle hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
              disabled={isLoading}
            >
              {showConfirm ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Feedback senhas não coincidem */}
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-500 -mt-1" role="alert">
              As senhas não coincidem.
            </p>
          )}

          {/* Checkbox de termos */}
          <div className="register-form__terms">
            <input
              type="checkbox"
              id="register-terms"
              checked={agreedToTerms}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAgreedToTerms(e.target.checked)
              }
              className="register-form__terms-checkbox"
              disabled={isLoading}
              aria-label="Concordar com os Termos"
            />
            <label htmlFor="register-terms" className="register-form__terms-label">
              Eu concordo com os{" "}
              <a
                href="#"
                className="register-form__terms-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
              >
                Termos
              </a>
            </label>
          </div>

          {/* Mensagem de erro da API */}
          {error && (
            <p
              className="text-sm text-red-500 -mt-1"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !allRulesValid || !passwordsMatch || !agreedToTerms}
            className="register-form__submit hover:bg-[#6a5fe0] active:bg-[#5c52cc] focus-visible:ring-[#7c6ff7]/50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Criando conta…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export function RegisterPage() {
  return (
    <main className="register-page lg:flex-row">
      {/* Coluna esquerda – formulário */}
      <aside
        className="register-page__form-col w-full lg:w-[50%]"
        aria-label="Formulário de cadastro"
      >
        <RegisterForm />
      </aside>

      {/* Coluna direita – hero */}
      <section
        className="register-page__hero"
        aria-label="Apresentação do produto"
      >
        <TaskLipLogo className="register-page__hero-logo mb-auto" />

        <div className="register-page__hero-content mt-16 lg:mt-0 lg:flex-1 lg:justify-center">
          <h2 className="register-page__headline text-6xl lg:text-8xl">
            Crie sua conta !
          </h2>

          <p className="register-page__cta">
            Já possui acesso?{" "}
            <Link
              to={ROUTES.LOGIN}
              className="register-page__cta-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
            >
              Entrar na sua Conta
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

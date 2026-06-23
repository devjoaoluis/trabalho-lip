import { useState } from "react"
import { Eye, EyeOff, CheckCircle2, Circle, Info } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { cn } from "#lib/utils"
import { useResetPassword } from "#hooks/useResetPassword"
import { ROUTES } from "../../router/routes"
import "./reset-password.css"

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
    <ul
      className="reset-password-form__password-hints"
      aria-label="Requisitos de senha"
    >
      {PASSWORD_RULES.map((rule) => {
        const valid = rule.test(password)
        const Icon = valid ? CheckCircle2 : password.length === 0 ? Info : Circle
        return (
          <li
            key={rule.label}
            className={cn(
              "reset-password-form__hint",
              valid && "reset-password-form__hint--valid"
            )}
          >
            <Icon
              size={13}
              className="reset-password-form__hint-icon"
              aria-hidden="true"
            />
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoading, error, submit } = useResetPassword()

  const token = searchParams.get("token") ?? ""
  const allRulesValid = PASSWORD_RULES.every((r) => r.test(password))
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allRulesValid || !passwordsMatch) return

    await submit(
      { token, password },
      () => navigate(ROUTES.LOGIN, { replace: true, state: { passwordReset: true } })
    )
  }

  return (
    <div className="reset-password-card-wrapper" aria-label="Área de redefinição de senha">
      {/* Sombra decorativa roxa */}
      <div className="reset-password-card-wrapper__shadow" aria-hidden="true" />

      {/* Card principal */}
      <div className="reset-password-card">
        <TaskLipLogo variant="dark" />

        <header className="reset-password-card__header">
          <h1 className="reset-password-card__title">Redefinição de Senha</h1>
          <p className="reset-password-card__subtitle">
            Crie uma nova senha para acessar sua conta.
          </p>
        </header>

        <form
          className="reset-password-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulário de redefinição de senha"
        >
          {/* Campo nova senha */}
          <div className="reset-password-form__field reset-password-form__field--password">
            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              autoComplete="new-password"
              required
              aria-label="Sua senha"
              aria-describedby="reset-password-hints"
              className="reset-password-form__input reset-password-form__input--password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="reset-password-form__password-toggle hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
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

          {/* Hints de validação — sempre visíveis */}
          <div id="reset-password-hints">
            <PasswordHints password={password} />
          </div>

          {/* Campo confirmação de senha */}
          <div className="reset-password-form__field reset-password-form__field--password">
            <Input
              id="reset-confirm-password"
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
              className="reset-password-form__input reset-password-form__input--password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="reset-password-form__password-toggle hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
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
            disabled={isLoading || !allRulesValid || !passwordsMatch}
            className="reset-password-form__submit hover:bg-[#6a5fe0] active:bg-[#5c52cc] focus-visible:ring-[#7c6ff7]/50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Salvando…" : "Salvar"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  return (
    <main
      className="reset-password-page"
      aria-label="Redefinição de senha"
    >
      <ResetPasswordForm />
    </main>
  )
}

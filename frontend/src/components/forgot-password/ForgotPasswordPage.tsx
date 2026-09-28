import { useState } from "react"
import { MailCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { useForgotPassword } from "#hooks/useForgotPassword"
import { ROUTES } from "../../router/routes"
import "./forgot-password.css"

function SuccessState() {
  return (
    <div className="forgot-password-success" aria-live="polite">
      <MailCheck
        size={40}
        className="forgot-password-success__icon"
        aria-hidden="true"
      />
      <p className="forgot-password-success__title">
        Link enviado com sucesso!
      </p>
      <p className="forgot-password-success__description">
        Verifique sua caixa de entrada e siga as instruções enviadas por e-mail para redefinir sua senha.
      </p>
      <Link
        to={ROUTES.LOGIN}
        className="forgot-password-success__link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
      >
        Voltar para o login
      </Link>
    </div>
  )
}


function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const { isLoading, error, success, submit } = useForgotPassword()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    await submit({ email })
  }

  return (
    <div
      className="forgot-password-card-wrapper"
      aria-label="Área de recuperação de senha"
    >
      {/* Sombra decorativa roxa */}
      <div className="forgot-password-card-wrapper__shadow" aria-hidden="true" />

      {/* Card principal */}
      <div className="forgot-password-card">
        <TaskLipLogo variant="dark" />

        {success ? (
          <SuccessState />
        ) : (
          <>
            <header className="forgot-password-card__header">
              <h1 className="forgot-password-card__title">Esqueceu sua senha?</h1>
              <p className="forgot-password-card__subtitle">
                Enviaremos um link para redefinir sua senha.<br />
                Siga as instruções enviadas pelo e-mail.
              </p>
            </header>

            <form
              className="forgot-password-form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Formulário de recuperação de senha"
            >
              {/* Campo e-mail */}
              <Input
                id="forgot-email"
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
                aria-label="Seu e-mail"
                className="forgot-password-form__input"
                disabled={isLoading}
              />

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

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !email.trim()}
                className="forgot-password-form__submit hover:bg-[#6a5fe0] active:bg-[#5c52cc] focus-visible:ring-[#7c6ff7]/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Enviando…" : "Enviar link"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export function ForgotPasswordPage() {
  return (
    <main
      className="forgot-password-page"
      aria-label="Recuperação de senha"
    >
      <ForgotPasswordForm />
    </main>
  )
}

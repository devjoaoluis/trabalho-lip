import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, ShieldCheck } from "lucide-react"
import { cn } from "#lib/utils"
import { Button } from "#components/ui/button"
import { Sidebar } from "#components/ui/Sidebar"
import { useForgotPassword } from "#hooks/useForgotPassword"
import { ROUTES } from "../../router/routes"
import "./settings.css"

/* ─── helpers ─────────────────────────────────────────────────── */
function getUserEmail(): string {
  try {
    const raw = localStorage.getItem("accessToken") ?? ""
    const payload = JSON.parse(atob(raw.split(".")[1] ?? "e30="))
    return (payload.email as string | undefined) ?? ""
  } catch {
    return ""
  }
}

function getUserName(): string {
  try {
    const raw = localStorage.getItem("accessToken") ?? ""
    const payload = JSON.parse(atob(raw.split(".")[1] ?? "e30="))
    return (payload.nome as string | undefined) ?? "Usuário"
  } catch {
    return "Usuário"
  }
}

/* ─── Main page ────────────────────────────────────────────────── */
export function SettingsPage() {
  const navigate = useNavigate()
  const userName = getUserName()
  const userEmail = getUserEmail()

  const [notifEnabled, setNotifEnabled] = useState(true)
  const { isLoading, error, success, submit } = useForgotPassword()

  function handleLogout() {
    localStorage.removeItem("accessToken")
    navigate(ROUTES.LOGIN, { replace: true })
  }

  async function handleChangePassword() {
    if (!userEmail) return
    await submit({ email: userEmail })
  }

  return (
    <div className="settings-layout">
      <Sidebar userName={userName} activePage="settings" onLogout={handleLogout} />

      <div className="settings-main">
        {/* Topbar com sino */}
        <header className="settings-topbar">
          <Button
            variant="outline"
            size="icon"
            className="tasks-topbar__bell hover:bg-white/10"
            aria-label="Notificações"
          >
            <Bell size={16} aria-hidden="true" />
          </Button>
        </header>

        {/* Conteúdo */}
        <main className="settings-content" aria-label="Configurações">

          {/* Card – Notificações */}
          <section className="settings-card" aria-label="Notificações">
            <div className="settings-card__header">
              <Bell size={16} className="text-white/60" aria-hidden="true" />
              <h2 className="settings-card__title">Notificações</h2>
            </div>

            <div className="settings-notif__row">
              <span className="settings-notif__label">Receber notificações</span>
              <button
                role="switch"
                aria-checked={notifEnabled}
                aria-label="Ativar ou desativar notificações"
                className={cn(
                  "settings-toggle",
                  notifEnabled ? "settings-toggle--on" : "settings-toggle--off"
                )}
                onClick={() => setNotifEnabled((v) => !v)}
              >
                <span
                  className={cn(
                    "settings-toggle__thumb",
                    notifEnabled ? "settings-toggle__thumb--on" : "settings-toggle__thumb--off"
                  )}
                />
              </button>
            </div>
          </section>

          {/* Card – Segurança */}
          <section className="settings-card" aria-label="Segurança">
            <div className="settings-card__header">
              <ShieldCheck size={16} className="text-white/60" aria-hidden="true" />
              <h2 className="settings-card__title">Segurança</h2>
            </div>

            <p className="settings-security__desc">
              Se você precisa trocar sua senha, basta clicar no botão abaixo e será enviada as instruções para o seu email
            </p>

            {error && (
              <p
                className="settings-feedback settings-feedback--error"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            )}
            {success && (
              <p
                className="settings-feedback settings-feedback--success"
                role="status"
                aria-live="polite"
              >
                Instruções enviadas para o seu e-mail.
              </p>
            )}

            <Button
              className="settings-btn-change-password hover:bg-[#6a5fe0] active:bg-[#5c52cc] focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
              onClick={() => void handleChangePassword()}
              disabled={isLoading || !userEmail}
            >
              {isLoading ? "Enviando…" : "Alterar senha"}
            </Button>
          </section>

        </main>
      </div>
    </div>
  )
}

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  LineChart,
  Settings,
  LogOut,
  Bell,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
} from "lucide-react"
import { cn } from "#lib/utils"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { Label } from "#components/ui/label"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { useChangePassword } from "#hooks/useChangePassword"
import { ROUTES } from "../../router/routes"
import "./settings.css"

/* ─── helpers ─────────────────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
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

/* ─── Sidebar ──────────────────────────────────────────────────── */
interface SidebarProps {
  userName: string
  onLogout: () => void
}

function Sidebar({ userName, onLogout }: SidebarProps) {
  const navigate = useNavigate()

  return (
    <nav className="tasks-sidebar" aria-label="Menu principal">
      <div className="tasks-sidebar__logo">
        <TaskLipLogo variant="white" className="tasklip-logo--sidebar" />
      </div>

      <ul className="tasks-sidebar__nav" role="list">
        <li>
          <Button
            variant="ghost"
            className="tasks-sidebar__item w-full justify-start hover:bg-white/5"
            aria-label="Início"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>Início</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="tasks-sidebar__item w-full justify-start hover:bg-white/5"
            aria-label="Tarefas"
            onClick={() => navigate(ROUTES.TASKS)}
          >
            <ClipboardList size={18} aria-hidden="true" />
            <span>Tarefas</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="tasks-sidebar__item w-full justify-start hover:bg-white/5"
            aria-label="Relatórios"
          >
            <BarChart2 size={18} aria-hidden="true" />
            <span>Relatórios</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="tasks-sidebar__item w-full justify-start hover:bg-white/5"
            aria-label="Estatísticas"
          >
            <LineChart size={18} aria-hidden="true" />
            <span>Estatísticas</span>
          </Button>
        </li>
      </ul>

      <div className="tasks-sidebar__footer">
        <div className="tasks-sidebar__user">
          <span className="tasks-sidebar__avatar" aria-hidden="true">
            {getInitials(userName)}
          </span>
          <span className="text-sm truncate">{userName}</span>
        </div>
        <Button
          variant="ghost"
          className="tasks-sidebar__item tasks-sidebar__item--active w-full justify-start"
          aria-label="Configurações"
          aria-current="page"
        >
          <Settings size={18} aria-hidden="true" />
          <span>Configurações</span>
        </Button>
        <Button
          variant="ghost"
          className="tasks-sidebar__item w-full justify-start hover:bg-red-500/10 hover:text-red-400"
          aria-label="Sair"
          onClick={onLogout}
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Sair</span>
        </Button>
      </div>
    </nav>
  )
}

/* ─── Password requirement item ────────────────────────────────── */
interface RequirementProps {
  ok: boolean
  label: string
}

function Requirement({ ok, label }: RequirementProps) {
  return (
    <li className="settings-req">
      <span
        className={cn("settings-req__icon", ok ? "settings-req__icon--ok" : "settings-req__icon--fail")}
        aria-hidden="true"
      >
        {ok && <Check size={10} />}
      </span>
      <span className={cn("settings-req", ok ? "settings-req__text--ok" : "settings-req__text--fail")}>
        {label}
      </span>
    </li>
  )
}

/* ─── Main page ────────────────────────────────────────────────── */
export function SettingsPage() {
  const navigate = useNavigate()
  const userName = getUserName()

  // Notifications toggle
  const [notifEnabled, setNotifEnabled] = useState(true)

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const { isLoading, error, success, submit } = useChangePassword()

  // Password requirements
  const hasSpecial = /[@#$%]/.test(newPassword)
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasMinLen = newPassword.length >= 8

  function handleLogout() {
    localStorage.removeItem("accessToken")
    navigate(ROUTES.LOGIN, { replace: true })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    await submit({ currentPassword, newPassword }, () => {
      setCurrentPassword("")
      setNewPassword("")
    })
  }

  return (
    <div className="settings-layout">
      <Sidebar userName={userName} onLogout={handleLogout} />

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
                className={cn("settings-toggle", notifEnabled ? "settings-toggle--on" : "settings-toggle--off")}
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

            <p className="settings-security__subtitle">Alterar sua senha</p>

            <form onSubmit={(e) => void handleSave(e)} noValidate aria-label="Formulário de alteração de senha">
              {/* Senha atual */}
              <div className="settings-field">
                <Label htmlFor="current-password" className="settings-field__label">
                  Senha atual <span className="settings-field__required">*</span>
                </Label>
                <div className="settings-field__input-wrap">
                  <Input
                    id="current-password"
                    type={showCurrent ? "text" : "password"}
                    className="settings-field__input focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
                    placeholder="Digite a senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="settings-field__eye"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-label={showCurrent ? "Ocultar senha atual" : "Mostrar senha atual"}
                  >
                    {showCurrent
                      ? <EyeOff size={16} aria-hidden="true" />
                      : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Nova senha */}
              <div className="settings-field">
                <Label htmlFor="new-password" className="settings-field__label">
                  Nova senha <span className="settings-field__required">*</span>
                </Label>
                <div className="settings-field__input-wrap">
                  <Input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    className="settings-field__input focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
                    placeholder="Digite a nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    aria-required="true"
                    aria-describedby="password-requirements"
                  />
                  <button
                    type="button"
                    className="settings-field__eye"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? "Ocultar nova senha" : "Mostrar nova senha"}
                  >
                    {showNew
                      ? <EyeOff size={16} aria-hidden="true" />
                      : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>

                {/* Requisitos */}
                <ul
                  id="password-requirements"
                  className="settings-requirements"
                  aria-label="Requisitos de senha"
                >
                  <Requirement ok={hasSpecial} label="Pelo menos uma caractere especial (@#$%)" />
                  <Requirement ok={hasUpper}   label="Pelo menos uma letra maiúscula" />
                  <Requirement ok={hasMinLen}  label="No mínimo 8 caracteres" />
                </ul>
              </div>

              {/* Feedback */}
              {error && (
                <p className="settings-feedback settings-feedback--error" role="alert" aria-live="polite">
                  {error}
                </p>
              )}
              {success && (
                <p className="settings-feedback settings-feedback--success" role="status" aria-live="polite">
                  {success}
                </p>
              )}

              {/* Botão salvar */}
              <Button
                type="submit"
                className="settings-btn-save hover:bg-[#6a5fe0] active:bg-[#5c52cc] focus-visible:ring-2 focus-visible:ring-[#7c6ff7]"
                disabled={isLoading || !currentPassword || !newPassword || !hasSpecial || !hasUpper || !hasMinLen}
              >
                {isLoading ? "Salvando…" : "Salvar"}
              </Button>
            </form>
          </section>

        </main>
      </div>
    </div>
  )
}

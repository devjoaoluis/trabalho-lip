import { useState } from "react"
import { ShieldCheck, Bell, Trash2, TriangleAlert, Loader2 } from "lucide-react"
import { cn } from "#lib/utils"
import { Button } from "#components/ui/button"
import { useForgotPassword } from "#hooks/useForgotPassword"
import { useUserContext } from "../../contexts/UserContext"
import { deleteUser, updateNotificationPreference } from "../../../service/user"
import { useNavigate } from "react-router-dom"
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

/* ─── Delete Account Modal ─────────────────────────────────────── */
interface DeleteAccountModalProps {
  onConfirm: () => Promise<void>
  onCancel: () => void
  isDeleting: boolean
}

function DeleteAccountModal({ onConfirm, onCancel, isDeleting }: DeleteAccountModalProps) {
  return (
    <div
      className="settings-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
    >
      <div className="settings-modal">
        {/* Ícone de aviso */}
        <div className="settings-modal__icon-wrapper" aria-hidden="true">
          <TriangleAlert size={28} className="text-red-400" />
        </div>

        <h2 id="delete-modal-title" className="settings-modal__title">
          Excluir conta
        </h2>

        <p id="delete-modal-desc" className="settings-modal__desc">
          Esta ação é <strong className="text-white/90">permanente e irreversível</strong>.
          Todos os seus dados, tarefas e relatórios serão apagados para sempre.
        </p>

        <p className="settings-modal__warning">
          Tem certeza que deseja continuar?
        </p>

        <div className="settings-modal__actions">
          <Button
            type="button"
            className="settings-modal__btn settings-modal__btn--cancel hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/30"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="settings-modal__btn settings-modal__btn--delete hover:bg-red-600 active:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500"
            onClick={() => void onConfirm()}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" aria-hidden="true" />
                Excluindo…
              </>
            ) : (
              <>
                <Trash2 size={14} className="mr-1.5" aria-hidden="true" />
                Sim, excluir minha conta
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ────────────────────────────────────────────────── */
export function SettingsPage() {
  const userEmail = getUserEmail()
  const { user, refetch } = useUserContext()
  const navigate = useNavigate()

  // Inicializa com o valor do servidor; null = ainda carregando
  const notifEnabled = user?.receberNotificacoes ?? false
  const [isTogglingNotif, setIsTogglingNotif] = useState(false)

  const { isLoading, error, success, submit } = useForgotPassword()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleChangePassword() {
    if (!userEmail) return
    await submit({ email: userEmail })
  }

  async function handleToggleNotif() {
    setIsTogglingNotif(true)
    try {
      await updateNotificationPreference(!notifEnabled)
      await refetch()
    } finally {
      setIsTogglingNotif(false)
    }
  }

  async function handleDeleteAccount() {
    if (!user) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteUser(user.id)
      localStorage.removeItem("accessToken")
      navigate(ROUTES.LOGIN, { replace: true })
    } catch {
      setDeleteError("Não foi possível excluir a conta. Tente novamente.")
      setIsDeleting(false)
    }
  }

  return (
    <div className="settings-main">
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
              disabled={isTogglingNotif || !user}
              className={cn(
                "settings-toggle",
                notifEnabled ? "settings-toggle--on" : "settings-toggle--off",
                (isTogglingNotif || !user) && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => void handleToggleNotif()}
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

        {/* Card – Zona de perigo */}
        <section className="settings-card settings-card--danger" aria-label="Zona de perigo">
          <div className="settings-card__header">
            <TriangleAlert size={16} className="text-red-400" aria-hidden="true" />
            <h2 className="settings-card__title settings-card__title--danger">Zona de perigo</h2>
          </div>

          <div className="settings-danger__row">
            <div className="settings-danger__info">
              <p className="settings-danger__label">Excluir conta</p>
              <p className="settings-danger__hint">
                Remove permanentemente sua conta e todos os seus dados do sistema.
              </p>
            </div>
            <Button
              type="button"
              className="settings-btn-delete hover:bg-red-600 active:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 shrink-0"
              onClick={() => { setShowDeleteModal(true); setDeleteError(null) }}
            >
              <Trash2 size={14} className="mr-1.5" aria-hidden="true" />
              Excluir conta
            </Button>
          </div>

          {deleteError && (
            <p
              className="settings-feedback settings-feedback--error mt-3"
              role="alert"
              aria-live="polite"
            >
              {deleteError}
            </p>
          )}
        </section>

      </main>

      {/* Modal de confirmação */}
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}

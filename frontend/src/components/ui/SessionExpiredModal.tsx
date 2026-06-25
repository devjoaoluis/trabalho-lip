import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock } from "lucide-react"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { ROUTES } from "../../router/routes"

const SESSION_EXPIRED_EVENT = "session:expired"

/** Call this anywhere (e.g., axios interceptor) to show the modal. */
export function dispatchSessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}

export function SessionExpiredModal() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    function handleExpired() {
      setVisible(true)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
  }, [])

  if (!visible) return null

  function handleRestart() {
    localStorage.removeItem("accessToken")
    setVisible(false)
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <div
      className="session-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Sessão expirada"
    >
      <div className="session-modal">
        {/* Logo */}
        <div className="session-modal__logo">
          <TaskLipLogo variant="dark" />
        </div>

        {/* Title */}
        <div className="session-modal__header">
          <Clock size={20} className="session-modal__header-icon" aria-hidden="true" />
          <h2 className="session-modal__title">SESSÃO EXPIRADA</h2>
        </div>

        {/* Body */}
        <p className="session-modal__question">Por que isso aconteceu?</p>
        <ul className="session-modal__list">
          <li>O sistema ficou sem utilização e por segurança a sessão foi encerrada.</li>
        </ul>

        {/* Action */}
        <button
          className="session-modal__btn"
          onClick={handleRestart}
          autoFocus
        >
          Reiniciar agora
        </button>
      </div>
    </div>
  )
}

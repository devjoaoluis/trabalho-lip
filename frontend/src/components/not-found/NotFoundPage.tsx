import { Link } from "react-router-dom"
import { MoveRight } from "lucide-react"
import { TaskLipLogo } from "#components/ui/TaskLipLogo"
import { ROUTES } from "../../router/routes"
import "./not-found.css"

export function NotFoundPage() {
  return (
    <main className="not-found-page flex-col lg:flex-row" aria-label="Página não encontrada">
     
      <section
        className="not-found-page__left"
        aria-hidden="true"
      >
        <span className="not-found-page__code">404</span>
        <hr className="not-found-page__divider" />
      </section>

     
      <aside
        className="not-found-page__right w-full lg:w-[55%]"
        aria-label="Informação sobre página não encontrada"
      >
        <div className="not-found-card">
          <TaskLipLogo variant="dark" />

          <h1 className="not-found-card__title">
            Página não<br />encontrada
          </h1>

          <p className="not-found-card__description">
            Não conseguimos encontrar esta página.<br />
            Verifique o endereço ou volte para o painel principal.
          </p>

          <Link
            to={ROUTES.DASHBOARD}
            className="not-found-card__link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c6ff7] rounded"
          >
            Voltar para DashBoard
            <MoveRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </main>
  )
}

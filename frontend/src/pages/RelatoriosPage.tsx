import { Sidebar } from "#components/layout/Sidebar"
import { RelatoriosPage as RelatoriosPageComponent } from "#components/relatorios/RelatoriosPage"
import "./dashboard.css"

export default function RelatoriosPage() {
  return (
    <div className="dashboard-page">
      <Sidebar />
      <RelatoriosPageComponent />
    </div>
  )
}

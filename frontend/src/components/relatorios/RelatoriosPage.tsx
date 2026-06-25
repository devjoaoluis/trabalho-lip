import { useState } from "react"
import { 
  Search, 
  ListFilter, 
  Trash2, 
  CheckSquare, 
  MoreVertical, 
  Check, 
  Calendar, 
  Pencil, 
  Plus, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"
import { Button } from "#components/ui/button"

import "./relatorios.css"

interface Relatorio {
  id: number
  name: string
  category: string
  date: string
  completed: boolean
}

export function RelatoriosPage() {
  const [search, setSearch] = useState("")

    const [relatorios, setRelatorios] = useState<Relatorio[]>([
    { id: 1, name: "Finalizar Projeto", category: "LIP", date: "24 May 13:00", completed: true }, 
  ])

  const toggleCheckbox = (id: number) => {
    setRelatorios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    )
  }

  return (
  <div className="relatorios-layout">
    <div className="relatorios-main-container">

      <div className="relatorios-col-esquerda">
        <header className="relatorios-filters-container">
          <div className="relatorios-search-wrapper">
            <Search size={16} className="text-white/30" />
            <input
              type="text"
              value={search}
              placeholder="Buscar relatório..."
              className="relatorios-search-input"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button className="relatorios-filter-btn">
            <ListFilter size={14} />
            Filtrar por período
          </button>
        </header>

        <section className="relatorios-card relatorios-card--list">
          <div className="relatorios-card__header">
            <div className="flex items-center gap-2">
              <h2 className="relatorios-card__title">Relatórios</h2>
              <span className="relatorios-badge">0</span>
            </div>
            <div className="relatorios-actions">
              <button className="relatorios-action-btn"><Trash2 size={16} /></button>
              <button className="relatorios-action-btn"><CheckSquare size={16} /></button>
            </div>
          </div>

          <div className="relatorios-list">
            {relatorios.map((relatorio) => (
              <div key={relatorio.id} className="relatorios-row">
                <div className="flex items-center gap-4">
                  <div className={`relatorios-checkbox ${relatorio.completed ? "checked" : ""}`}
                    onClick={() => toggleCheckbox(relatorio.id)}>
                    {relatorio.completed && <Check size={12} className="text-[#0d0f1e]" />}
                  </div>
                  <div>
                    <p className="relatorios-row__name">{relatorio.name}</p>
                    <p className="relatorios-row__sub">{relatorio.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="relatorios-row__date">{relatorio.date}</span>
                  <button className="text-white/40 hover:text-white">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <footer className="relatorios-pagination">
            <span className="text-xs text-white/40">Mostrando 1-9 de 24 relatórios</span>
            <div className="relatorios-pagination__controls">
              <button className="relatorios-page-arrow"><ChevronLeft size={14} /></button>
              <button className="relatorios-page-num active">1</button>
              <span className="text-white/20 text-xs">...</span>
              <button className="relatorios-page-num">3</button>
              <button className="relatorios-page-arrow"><ChevronRight size={14} /></button>
            </div>
          </footer>
        </section>
      </div>

      <section className="relatorios-card relatorios-card--form">
        <h2 className="relatorios-form__main-title">Relatório</h2>

        <div className="relatorios-form-group">
          <label className="relatorios-label flex items-center justify-between">
            Nome do Relatório
            <Pencil size={12} className="text-white/40 cursor-pointer hover:text-white" />
          </label>
        </div>

        <div className="relatorios-form-group">
          <label className="relatorios-label uppercase tracking-wider font-bold">De</label>
          <div className="relatorios-date-row">
            <div className="relatorios-date-display">
              <Calendar size={16} className="text-[#5f52eb]" />
              <span>25/05/2026</span>
            </div>
            <button className="relatorios-alterar-btn">Alterar</button>
          </div>
        </div>

        <div className="relatorios-form-group mt-4">
          <label className="relatorios-label uppercase tracking-wider font-bold">Até</label>
          <div className="relatorios-date-row">
            <div className="relatorios-date-display">
              <Calendar size={16} className="text-[#5f52eb]" />
              <span>28/05/2026</span>
            </div>
            <button className="relatorios-alterar-btn">Alterar</button>
          </div>
        </div>

        <Button className="relatorios-btn-primary hover:opacity-90">
          <Plus size={16} />
          Gerar relatório
        </Button>
      </section>

    </div>
  </div>
)
}
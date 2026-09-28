import { useState, useEffect, useCallback } from "react"
import {
  ListFilter, Trash2, CheckSquare, MoreVertical, Calendar,
  Pencil, Plus, ChevronLeft, ChevronRight, Eye, Loader2,
} from "lucide-react"
import { Button } from "#components/ui/button"
import { CalendarWidget } from "#components/dashboard/CalendarWidget"
import {
  getRelatorios, getRelatorioById, createRelatorio,
  type Relatorio,
} from "../../../service/report"
import "./relatorios.css"

const ITEMS_PER_PAGE = 5

function formatarParaAPI(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, "0")
  const dia = String(data.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}

function formatarParaExibicao(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-")
  return `${dia}/${mes}/${ano}`
}

export function RelatoriosPage() {
  // ── Estado de geração ─────────────────────────────────────
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const [dataInicio, setDataInicio]       = useState<Date | null>(hoje)
  const [dataFim, setDataFim]             = useState<Date | null>(hoje)
  const [calendarioAberto, setCalendarioAberto] = useState<"inicio" | "fim" | null>(null)
  const [nomeRelatorio, setNomeRelatorio] = useState("Meu Relatório")
  const [isEditing, setIsEditing]         = useState(false)
  const [isCreating, setIsCreating]       = useState(false)
  const [createError, setCreateError]     = useState<string | null>(null)

  // ── Estado da listagem ────────────────────────────────────
  const [relatorios, setRelatorios]         = useState<Relatorio[]>([])
  const [loading, setLoading]               = useState(true)
  const [listError, setListError]           = useState<string | null>(null)
  const [idsOcultados, setIdsOcultados]     = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("relatorios_ocultos") ?? "[]") }
    catch { return [] }
  })
  const [menuAbertoId, setMenuAbertoId]     = useState<string | null>(null)
  const [currentPage, setCurrentPage]       = useState(1)

  // ── Estado do filtro de período ───────────────────────────
  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | null>(null)
  const [filtroDataFim, setFiltroDataFim]       = useState<Date | null>(null)
  const [filtroAberto, setFiltroAberto]         = useState(false)
  const [filtroEtapa, setFiltroEtapa]           = useState<"inicio" | "fim">("inicio")
  const [filtroError, setFiltroError]           = useState<string | null>(null)

  // ── Estado do modal de detalhes ───────────────────────────
  const [modalAberto, setModalAberto]           = useState(false)
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null)
  const [loadingDetalhes, setLoadingDetalhes]   = useState(false)
  const [detalhesError, setDetalhesError]       = useState<string | null>(null)

  // ── Carregamento da listagem ──────────────────────────────
  const carregarRelatorios = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const dados = await getRelatorios()
      setRelatorios(dados)
    } catch {
      setListError("Não foi possível carregar os relatórios.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void carregarRelatorios() }, [carregarRelatorios])

  // ── Geração de relatório ──────────────────────────────────
  async function handleAdicionarRelatorio() {
    if (!dataInicio || !dataFim) {
      setCreateError("Selecione as datas de início e fim.")
      return
    }
    if (dataFim < dataInicio) {
      setCreateError("A data de término não pode ser anterior à data de início.")
      return
    }
    setIsCreating(true)
    setCreateError(null)
    try {
      await createRelatorio({
        periodoInicio: formatarParaAPI(dataInicio),
        periodoFim: formatarParaAPI(dataFim),
      })
      await carregarRelatorios()
    } catch {
      setCreateError("Erro ao gerar o relatório. Tente novamente.")
    } finally {
      setIsCreating(false)
    }
  }

  // ── Abrir detalhes ────────────────────────────────────────
  async function abrirDetalhesRelatorio(id: string) {
    setModalAberto(true)
    setLoadingDetalhes(true)
    setDetalhesError(null)
    setMenuAbertoId(null)
    try {
      const dados = await getRelatorioById(id)
      setRelatorioSelecionado(dados)
    } catch {
      setDetalhesError("Erro ao buscar detalhes do relatório.")
    } finally {
      setLoadingDetalhes(false)
    }
  }

  // ── Remover da lista localmente ───────────────────────────
  function ocultarRelatorio(id: string) {
    setMenuAbertoId(null)
    const novas = [...idsOcultados, id]
    setIdsOcultados(novas)
    localStorage.setItem("relatorios_ocultos", JSON.stringify(novas))
  }

  // ── Handler de seleção de data no formulário ──────────────
  function handleSelectDataFormulario(data: Date | null) {
    if (calendarioAberto === "inicio") {
      setDataInicio(data)
      // Após selecionar início, abre fim automaticamente se ainda não tem fim
      if (data && !dataFim) setCalendarioAberto("fim")
      else setCalendarioAberto(null)
    } else {
      setDataFim(data)
      setCalendarioAberto(null)
    }
  }

  // ── Handler de seleção de data no filtro ─────────────────
  function handleSelectDataFiltro(data: Date | null) {
    if (filtroEtapa === "inicio") {
      setFiltroDataInicio(data)
      setFiltroError(null)
      if (data) setFiltroEtapa("fim") // avança para etapa fim
    } else {
      if (data && filtroDataInicio && data < filtroDataInicio) {
        setFiltroError("A data final não pode ser anterior à data inicial.")
        return
      }
      setFiltroDataFim(data)
      setFiltroError(null)
      if (data) setFiltroAberto(false) // fecha após selecionar fim
    }
  }

  // ── Fechar popovers ao clicar fora ────────────────────────
  useEffect(() => {
    function fecharAoClicarFora(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest(".relatorios-calendario-wrapper") && !target.closest(".relatorios-alterar-btn")) {
        setCalendarioAberto(null)
      }
      if (!target.closest(".relatorios-menu-container")) {
        setMenuAbertoId(null)
      }
      if (!target.closest(".relatorios-filter-wrapper")) {
        setFiltroAberto(false)
      }
    }
    document.addEventListener("mousedown", fecharAoClicarFora)
    return () => document.removeEventListener("mousedown", fecharAoClicarFora)
  }, [])

  // ── Reseta paginação ao mudar filtro ──────────────────────
  useEffect(() => { setCurrentPage(1) }, [filtroDataInicio, filtroDataFim])

  // ── Filtragem e paginação ─────────────────────────────────
  const relatoriosFiltrados = relatorios
    .filter((r) => !idsOcultados.includes(r.id))
    .filter((r) => {
      if (!filtroDataInicio || !filtroDataFim) return true
      const inicio = new Date(r.periodoInicio + "T00:00:00")
      const fim    = new Date(r.periodoFim    + "T00:00:00")
      return inicio >= filtroDataInicio && fim <= filtroDataFim
    })

  const totalPages        = Math.max(1, Math.ceil(relatoriosFiltrados.length / ITEMS_PER_PAGE))
  const indexOfFirst      = (currentPage - 1) * ITEMS_PER_PAGE
  const currentRelatorios = relatoriosFiltrados.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE)

  return (
    <div className="tasks-panel">
      <div className="relatorios-main-container">

        {/* ── COLUNA ESQUERDA ─────────────────────────────── */}
        <div className="flex flex-col gap-6 w-full">

          {/* Filtro de período */}
          <header className="relatorios-filters-container">
            <div className="relatorios-filter-wrapper relative">
              <button
                className={`relatorios-filter-btn ${filtroDataInicio && filtroDataFim ? "relatorios-filter-btn--active" : ""}`}
                onClick={() => { setFiltroAberto(!filtroAberto); setFiltroEtapa("inicio") }}
              >
                <ListFilter size={14} aria-hidden="true" />
                {filtroDataInicio && filtroDataFim
                  ? `${filtroDataInicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} – ${filtroDataFim.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`
                  : "Filtrar por período"}
              </button>

              {filtroAberto && (
                <div className="relatorios-filter-popover">
                  <div className="relatorios-filter-popover__header">
                    <span className="relatorios-filter-popover__label">
                      {filtroEtapa === "inicio" ? "Selecione a data inicial" : "Selecione a data final"}
                    </span>
                    {(filtroDataInicio || filtroDataFim) && (
                      <button
                        className="relatorios-filter-popover__clear"
                        onClick={() => {
                          setFiltroDataInicio(null)
                          setFiltroDataFim(null)
                          setFiltroEtapa("inicio")
                          setFiltroAberto(false)
                          setFiltroError(null)
                        }}
                      >
                        Limpar filtro
                      </button>
                    )}
                  </div>

                  {filtroEtapa === "fim" && filtroDataInicio && (
                    <div className="relatorios-filter-etapa">
                      <span className="relatorios-filter-etapa__label">De:</span>
                      <span className="relatorios-filter-etapa__value">
                        {filtroDataInicio.toLocaleDateString("pt-BR")}
                      </span>
                      <button
                        className="relatorios-filter-etapa__edit"
                        onClick={() => setFiltroEtapa("inicio")}
                      >
                        Alterar
                      </button>
                    </div>
                  )}

                  {filtroError && (
                    <p className="text-xs text-red-400" role="alert">{filtroError}</p>
                  )}

                  <div className="relatorios-calendario-wrapper">
                    <CalendarWidget
                      selectedDate={filtroEtapa === "inicio" ? filtroDataInicio : filtroDataFim}
                      onSelectDate={handleSelectDataFiltro}
                    />
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Card de listagem */}
          <section className="dashboard-card relatorios-card--list" aria-label="Lista de relatórios">
            <div className="relatorios-card__header">
              <div className="flex items-center gap-2">
                <h2 className="relatorios-card__title">Relatórios</h2>
                <span className="relatorios-badge">{relatoriosFiltrados.length}</span>
              </div>
            </div>

            <div className="relatorios-list">
              {loading ? (
                <div className="relatorios-empty-state">
                  <Loader2 size={20} className="animate-spin text-white/30" aria-hidden="true" />
                  <span>Carregando relatórios…</span>
                </div>
              ) : listError ? (
                <div className="relatorios-empty-state" role="alert">
                  <span className="text-red-400">{listError}</span>
                  <button className="relatorios-retry-btn" onClick={carregarRelatorios}>Tentar novamente</button>
                </div>
              ) : relatoriosFiltrados.length === 0 ? (
                <div className="relatorios-empty-state">
                  <span>Nenhum relatório encontrado.</span>
                </div>
              ) : (
                currentRelatorios.map((relatorio) => (
                  <div key={relatorio.id} className="relatorios-row">
                    <div className="flex items-center gap-4">
                      <div className="relatorios-row__icon">
                        <CheckSquare size={16} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="relatorios-row__name">
                          Relatório de Tarefas ({relatorio.totalConcluidas} concluídas)
                        </p>
                        <p className="relatorios-row__sub">
                          {relatorio.totalPendentes} pendentes restantes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="relatorios-row__date">
                        {formatarParaExibicao(relatorio.periodoInicio)} – {formatarParaExibicao(relatorio.periodoFim)}
                      </span>
                      <div className="relatorios-menu-container relative">
                        <button
                          className="relatorios-menu-trigger"
                          aria-label="Opções do relatório"
                          onClick={() => setMenuAbertoId(menuAbertoId === relatorio.id ? null : relatorio.id)}
                        >
                          <MoreVertical size={16} aria-hidden="true" />
                        </button>
                        {menuAbertoId === relatorio.id && (
                          <div className="relatorios-dropdown" role="menu">
                            <button className="relatorios-dropdown__item" role="menuitem" onClick={() => abrirDetalhesRelatorio(relatorio.id)}>
                              <Eye size={14} className="text-[#a39bf5]" aria-hidden="true" /> Abrir relatório
                            </button>
                            <button className="relatorios-dropdown__item relatorios-dropdown__item--danger" role="menuitem" onClick={() => ocultarRelatorio(relatorio.id)}>
                              <Trash2 size={14} aria-hidden="true" /> Remover
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <footer className="relatorios-pagination" aria-label="Paginação">
              <span className="text-xs text-white/40">
                {relatoriosFiltrados.length > 0
                  ? `Mostrando ${indexOfFirst + 1}–${Math.min(indexOfFirst + ITEMS_PER_PAGE, relatoriosFiltrados.length)} de ${relatoriosFiltrados.length}`
                  : "0 resultados"}
              </span>
              <div className="relatorios-pagination__controls">
                <button className="relatorios-page-arrow" disabled={currentPage === 1} aria-label="Página anterior" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
                  <ChevronLeft size={14} aria-hidden="true" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={`relatorios-page-num ${currentPage === n ? "active" : ""}`} aria-current={currentPage === n ? "page" : undefined} onClick={() => setCurrentPage(n)}>
                    {n}
                  </button>
                ))}
                <button className="relatorios-page-arrow" disabled={currentPage === totalPages} aria-label="Próxima página" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
            </footer>
          </section>
        </div>

        {/* ── COLUNA DIREITA — formulário de geração ───────── */}
        <section className="dashboard-card relatorios-card--form" aria-label="Gerar novo relatório">
          <h2 className="relatorios-form__main-title">Relatório</h2>

          {/* Nome editável */}
          <div className="relatorios-form-group">
            <label className="relatorios-label">
              {isEditing ? (
                <input
                  type="text"
                  value={nomeRelatorio}
                  autoFocus
                  className="relatorios-name-input"
                  aria-label="Nome do relatório"
                  onChange={(e) => setNomeRelatorio(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => { if (e.key === "Enter") setIsEditing(false) }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span>{nomeRelatorio}</span>
                  <button onClick={() => setIsEditing(true)} aria-label="Editar nome do relatório">
                    <Pencil size={12} className="text-white/40 transition-colors" aria-hidden="true" />
                  </button>
                </div>
              )}
            </label>
          </div>

          {/* Data de início */}
          <div className="relatorios-form-group mt-4">
            <label className="relatorios-label uppercase tracking-wider font-bold">Início</label>
            <div className="relatorios-date-row">
              <div className="relatorios-date-display">
                <Calendar size={16} className="text-[#5f52eb]" aria-hidden="true" />
                <span>{dataInicio ? dataInicio.toLocaleDateString("pt-BR") : "Selecionar data"}</span>
              </div>
              <div className="relatorios-calendario-wrapper relative">
                <button
                  className="relatorios-alterar-btn"
                  onClick={() => setCalendarioAberto(calendarioAberto === "inicio" ? null : "inicio")}
                  aria-label="Alterar data de início"
                >
                  Alterar
                </button>
                {calendarioAberto === "inicio" && (
                  <div className="relatorios-calendario-popover">
                    <CalendarWidget
                      selectedDate={dataInicio}
                      onSelectDate={handleSelectDataFormulario}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data de fim */}
          <div className="relatorios-form-group mt-4">
            <label className="relatorios-label uppercase tracking-wider font-bold">Até</label>
            <div className="relatorios-date-row">
              <div className="relatorios-date-display">
                <Calendar size={16} className="text-[#5f52eb]" aria-hidden="true" />
                <span>{dataFim ? dataFim.toLocaleDateString("pt-BR") : "Selecionar data"}</span>
              </div>
              <div className="relatorios-calendario-wrapper relative">
                <button
                  className="relatorios-alterar-btn"
                  onClick={() => setCalendarioAberto(calendarioAberto === "fim" ? null : "fim")}
                  aria-label="Alterar data de fim"
                >
                  Alterar
                </button>
                {calendarioAberto === "fim" && (
                  <div className="relatorios-calendario-popover">
                    <CalendarWidget
                      selectedDate={dataFim}
                      onSelectDate={handleSelectDataFormulario}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {createError && (
            <p className="text-xs text-red-400 mt-2" role="alert" aria-live="polite">{createError}</p>
          )}

          <Button
            className="relatorios-btn-primary mt-6 w-full"
            disabled={isCreating}
            onClick={handleAdicionarRelatorio}
            aria-label="Gerar relatório"
          >
            {isCreating
              ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Gerando…</>
              : <><Plus size={16} aria-hidden="true" /> Gerar relatório</>}
          </Button>
        </section>
      </div>

      {/* ── MODAL DE DETALHES ──────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Detalhes do relatório">
          <div className="relatorios-modal">
            <div className="relatorios-modal__header">
              <div>
                <h3 className="relatorios-modal__title">Resumo de Produtividade</h3>
                <p className="relatorios-modal__id">ID: {relatorioSelecionado?.id ?? "Carregando…"}</p>
              </div>
              <button className="relatorios-modal__close" onClick={() => { setModalAberto(false); setRelatorioSelecionado(null) }} aria-label="Fechar modal">
                Fechar
              </button>
            </div>

            {loadingDetalhes ? (
              <div className="relatorios-modal__loading">
                <Loader2 size={20} className="animate-spin text-white/30" aria-hidden="true" />
                <span>Buscando estatísticas…</span>
              </div>
            ) : detalhesError ? (
              <div className="relatorios-modal__loading" role="alert">
                <span className="text-red-400">{detalhesError}</span>
              </div>
            ) : relatorioSelecionado && (
              <div className="space-y-5">
                <div className="relatorios-modal__periodo">
                  <Calendar size={18} className="text-[#5f52eb]" aria-hidden="true" />
                  <div className="text-xs">
                    <p className="text-white/40">Período Gerado</p>
                    <p className="font-medium mt-0.5">
                      {formatarParaExibicao(relatorioSelecionado.periodoInicio)} até {formatarParaExibicao(relatorioSelecionado.periodoFim)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relatorios-modal__kpi relatorios-modal__kpi--green">
                    <span className="relatorios-modal__kpi-value">{relatorioSelecionado.totalConcluidas}</span>
                    <span className="relatorios-modal__kpi-label">Concluídas</span>
                  </div>
                  <div className="relatorios-modal__kpi relatorios-modal__kpi--orange">
                    <span className="relatorios-modal__kpi-value">{relatorioSelecionado.totalPendentes}</span>
                    <span className="relatorios-modal__kpi-label">Pendentes</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">Histórico Diário de Entregas</h4>
                  <div className="relatorios-modal__history">
                    {Object.keys(relatorioSelecionado.concluidasPorDia).length === 0 ? (
                      <p className="p-4 text-center text-xs text-white/30">Nenhuma tarefa finalizada neste período.</p>
                    ) : (
                      Object.entries(relatorioSelecionado.concluidasPorDia).map(([dataISO, qtd]) => (
                        <div key={dataISO} className="relatorios-modal__history-row">
                          <span className="text-white/70">{formatarParaExibicao(dataISO)}</span>
                          <span className="relatorios-modal__history-badge">{qtd} {qtd === 1 ? "tarefa feita" : "tarefas feitas"}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-white/20 text-right pt-2 border-t border-white/5">
                  Extraído em: {new Date(relatorioSelecionado.geradoEm).toLocaleString("pt-BR")}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

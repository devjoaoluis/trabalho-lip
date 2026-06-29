import { useState, useEffect } from "react"
import { Search, ListFilter, Trash2, CheckSquare, MoreVertical, Calendar, Pencil, Plus, ChevronLeft, ChevronRight,Eye} from "lucide-react"
import { Button } from "#components/ui/button"
import { CalendarWidget } from "#components/dashboard/CalendarWidget"

import "./relatorios.css"

interface Relatorio {
  id: string
  usuarioId: string
  totalConcluidas: number
  totalPendentes: number
  concluidasPorDia: Record<string, number>
  periodoInicio: string
  periodoFim: string
  geradoEm: string
}

export function RelatoriosPage() {
  const [search, setSearch] = useState("")
  const [dataInicio, setDataInicio] = useState<Date>(new Date(2026, 4, 25))
  const [dataFim, setDataFim] = useState<Date>(new Date(2026, 4, 28))
  const [calendarioAberto, setCalendarioAberto] = useState<"de" | "ate" | null>(null)

  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | null>(null)
  const [filtroDataFim, setFiltroDataFim] = useState<Date | null>(null)
  const [calendarioFiltroAberto, setCalendarioFiltroAberto] = useState<"de" | "ate" | null>(null)

  const [nomeRelatorio, setNomeRelatorio] = useState("Meu Relatório")
  const [isEditing, setIsEditing] = useState(false)

  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)

  const [modalAberto, setModalAberto] = useState(false)
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)

  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null)

  const [idsOcultados, setIdsOcultados] = useState<string[]>(() => {
    const salvos = localStorage.getItem("meus_relatorios_ocultos")
    return salvos ? JSON.parse(salvos) : []
  })

  const [subCalendarioFiltro, setSubCalendarioFiltro] = useState<"de" | "ate" | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const API_URL = "http://localhost:3300"

  const getAuthHeader = () => {
    const token = localStorage.getItem("meu_token_jwt")
    return {
      "accept": "application/json",
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }

  const formatarParaAPI = (data: Date) => {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, "0")
    const dia = String(data.getDate()).padStart(2, "0")
    return `${ano}-${mes}-${dia}`
  }

  const formatarParaExibicao = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split("-")
    return `${dia}/${mes}/${ano}`
  }

  const carregarRelatorios = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/report`, {
        method: "GET",
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error()
      const dados: Relatorio[] = await response.json()
      setRelatorios(dados)
    } catch {
      alert("Não foi possível carregar a lista de relatórios.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRelatorios()
  }, [])
  
  const handleAdicionarRelatorio = async () => {
    if (!nomeRelatorio.trim()) return
    if (dataFim < dataInicio) {
      alert("A data de término não pode ser anterior à data de início.")
      return
    }

    try {
      const payload = {
        periodoInicio: formatarParaAPI(dataInicio),
        periodoFim: formatarParaAPI(dataFim)
      }
      const response = await fetch(`${API_URL}/report`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error()
      await carregarRelatorios()
    } catch {
      alert("Erro ao gerar o relatório.")
    }
  }

  const abrirDetalhesRelatorio = async (id: string) => {
    try {
      setModalAberto(true)
      setLoadingDetalhes(true)
      setMenuAbertoId(null)
      const response = await fetch(`${API_URL}/report/${id}`, {
        method: "GET",
        headers: getAuthHeader()
      })
      if (!response.ok) throw new Error()
      const dados: Relatorio = await response.json()
      setRelatorioSelecionado(dados)
    } catch {
      alert("Erro ao buscar detalhes do relatório.")
      setModalAberto(false)
    } finally {
      setLoadingDetalhes(false)
    }
  }

  const deletarRelatorio = (id: string) => {
    if (!confirm("Deseja mesmo ocultar este relatório da sua lista?")) return
    setMenuAbertoId(null)
    const novasOcultacoes = [...idsOcultados, id]
    setIdsOcultados(novasOcultacoes)
    localStorage.setItem("meus_relatorios_ocultos", JSON.stringify(novasOcultacoes))
  }

  // FILTRAGEM COMBINADA
  const relatoriosFiltrados = relatorios
    .filter((relatorio) => !idsOcultados.includes(relatorio.id))
    .filter((relatorio) => {
      if (!filtroDataInicio || !filtroDataFim) return true
      
      const inicioRelatorio = new Date(relatorio.periodoInicio + "T00:00:00")
      const fimRelatorio = new Date(relatorio.periodoFim + "T00:00:00")
      
      return inicioRelatorio >= filtroDataInicio && fimRelatorio <= filtroDataFim
    })
    .filter((relatorio) =>
      relatorio.id.toLowerCase().includes(search.toLowerCase()) ||
      relatorio.periodoInicio.includes(search)
    )

  // Cálculos de paginação baseados no array final filtrado
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentRelatorios = relatoriosFiltrados.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(relatoriosFiltrados.length / ITEMS_PER_PAGE) || 1

  // Reseta para a página inicial ao digitar algo na pesquisa ou mudar o filtro de data
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filtroDataInicio, filtroDataFim])

  // Fecha os popovers de calendário e menus flutuantes ao clicar fora deles
  useEffect(() => {
    const fecharAoClicarFora = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      if (!target.closest(".relatorios-alterar-btn") && !target.closest(".calendario-popover")) {
        setCalendarioAberto(null)
      }
      
      if (!target.closest(".relatorios-menu-container")) {
        setMenuAbertoId(null)
      }

      if (!target.closest(".relatorios-filter-wrapper") && !target.closest(".calendario-popover")) {
        setCalendarioFiltroAberto(null)
      }
    }

    document.addEventListener("click", fecharAoClicarFora)
    return () => document.removeEventListener("click", fecharAoClicarFora)
  }, [])

  // Captura do clique no calendário via DOM (Formulário Direita)
  const capturarDataDoDOM = (container: HTMLElement, tipo: "de" | "ate") => {
    const botaoSelecionado = container.querySelector("button[class*='bg-[#5a4cf2]']")
    if (botaoSelecionado instanceof HTMLElement) {
      const dia = botaoSelecionado.innerText.padStart(2, "0")
      const textoMes = container.querySelector(".capitalize")?.textContent?.toLowerCase() || ""
      const ano = container.querySelector(".flex.gap-2 span:last-child")?.textContent || "2026"

      const meses: { [key: string]: string } = {
        jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", 
        jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12"
      }

      const prefixoMes = textoMes.trim().substring(0, 3)
      const numeroMes = meses[prefixoMes] || "05"
      const dataReal = new Date(Number(ano), Number(numeroMes) - 1, Number(dia))
      
      if (tipo === "de") setDataInicio(dataReal)
      else setDataFim(dataReal)
      setCalendarioAberto(null)
    }
  }

  // Captura o clique no calendário interno do popover do botão "Filtrar por período"
  const capturarDataFiltroDoDOM = (container: HTMLElement, tipo: "de" | "ate") => {
    const botaoSelecionado = container.querySelector("button[class*='bg-[#5a4cf2]']")
    if (botaoSelecionado instanceof HTMLElement) {
      const dia = botaoSelecionado.innerText.padStart(2, "0")
      const textoMes = container.querySelector(".capitalize")?.textContent?.toLowerCase() || ""
      const ano = container.querySelector(".flex.gap-2 span:last-child")?.textContent || "2026"

      const meses: { [key: string]: string } = {
        jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", 
        jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12"
      }

      const prefixoMes = textoMes.trim().substring(0, 3)
      const numeroMes = meses[prefixoMes] || "05"
      const dataReal = new Date(Number(ano), Number(numeroMes) - 1, Number(dia))
      
      if (tipo === "de") {
        setFiltroDataInicio(dataReal)
        setCalendarioFiltroAberto("ate")
      } else {
        if (filtroDataInicio && dataReal < filtroDataInicio) {
          alert("A data final do filtro não pode ser anterior à data inicial.")
          return
        }
        setFiltroDataFim(dataReal)
        setCalendarioFiltroAberto(null)
      }
    }
  }

  return (
    <div className="relatorios-layout">
      <div className="relatorios-main-container">
        
        {/* COLUNA DA ESQUERDA (BUSCA E LISTAGEM) */}
        <div className="relatorios-col-esquerda">
          <header className="relatorios-filters-container">
            <div className="relatorios-search-wrapper">
              <Search size={16} className="text-white/30" />
              <input
                type="text"
                value={search}
                placeholder="Buscar relatório por ID ou data..."
                className="relatorios-search-input"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* COMPONENTE DO BOTÃO: Filtrar por período */}
            <div className="relatorios-filter-wrapper relative">
              <button 
                className={`relatorios-filter-btn flex items-center gap-1.5 transition-colors ${
                  filtroDataInicio && filtroDataFim ? "text-[#a39bf5] border-[#5f52eb]" : ""
                }`}
                onClick={() => setCalendarioFiltroAberto(calendarioFiltroAberto ? null : "de")}
              >
                <ListFilter size={14} />
                {filtroDataInicio && filtroDataFim ? (
                  `${filtroDataInicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} - ${filtroDataFim.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`
                ) : (
                  "Filtrar por período"
                )}
              </button>

              {/* Popover flutuante com as configurações do filtro de período */}
              {calendarioFiltroAberto && (
                <div className="absolute left-0 mt-2 p-4 bg-[#111326] border border-white/10 rounded-xl shadow-2xl z-50 w-80 text-white flex flex-col gap-4 min-w-[320px]">
                  
                  {/* Cabeçalho do Filtro */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 w-full">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Filtrar Tabela</span>
                    {(filtroDataInicio || filtroDataFim) && (
                      <button 
                        className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
                        onClick={() => {
                          setFiltroDataInicio(null)
                          setFiltroDataFim(null)
                          setSubCalendarioFiltro(null)
                          setCalendarioFiltroAberto(null)
                        }}
                      >
                        Limpar Filtro
                      </button>
                    )}
                  </div>

                  {/* Bloco FILTRO DE */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">De</label>
                    <div className="relatorios-date-row flex items-center w-full gap-2">
                      <div className="relatorios-date-display flex-1">
                        <Calendar size={16} className="text-[#5f52eb]" />
                        <span className="whitespace-nowrap">{filtroDataInicio ? filtroDataInicio.toLocaleDateString("pt-BR") : "Selecionar data"}</span>
                      </div>
                      
                      <div className="calendario-modal-wrapper relative shrink-0">
                        <div className="calendario-popover-container">
                          <button 
                            className="relatorios-alterar-btn"
                            onClick={() => setSubCalendarioFiltro(subCalendarioFiltro === "de" ? null : "de")}
                          >
                            Alterar
                          </button>

                          {subCalendarioFiltro === "de" && (
                            <div 
                              className="calendario-popover absolute right-0 top-full mt-1 z-50" 
                              onClick={(e) => {
                                const container = e.currentTarget
                                if ((e.target as HTMLElement).closest("button")) {
                                  setTimeout(() => {
                                    capturarDataFiltroDoDOM(container, "de")
                                    setSubCalendarioFiltro("ate")
                                  }, 1)
                                  e.stopPropagation()
                                }
                              }}
                            >
                              <CalendarWidget key={filtroDataInicio?.getTime()} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloco FILTRO ATÉ */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Até</label>
                    <div className="relatorios-date-row flex items-center w-full gap-2">
                      <div className="relatorios-date-display flex-1">
                        <Calendar size={16} className="text-[#5f52eb]" />
                        <span className="whitespace-nowrap">{filtroDataFim ? filtroDataFim.toLocaleDateString("pt-BR") : "Selecionar data"}</span>
                      </div>
                      
                      <div className="calendario-modal-wrapper relative shrink-0">
                        <div className="calendario-popover-container">
                          <button 
                            className="relatorios-alterar-btn"
                            onClick={() => setSubCalendarioFiltro(subCalendarioFiltro === "ate" ? null : "ate")}
                          >
                            Alterar
                          </button>

                          {subCalendarioFiltro === "ate" && (
                            <div 
                              className="calendario-popover absolute right-0 top-full mt-1 z-50" 
                              onClick={(e) => {
                                const container = e.currentTarget
                                if ((e.target as HTMLElement).closest("button")) {
                                  setTimeout(() => {
                                    capturarDataFiltroDoDOM(container, "ate")
                                    setSubCalendarioFiltro(null)
                                  }, 1)
                                  e.stopPropagation()
                                }
                              }}
                            >
                              <CalendarWidget key={filtroDataFim?.getTime()} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </header>
          <section className="relatorios-card relatorios-card--list">
            <div className="relatorios-card__header">
              <div className="flex items-center gap-2">
                <h2 className="relatorios-card__title">Relatórios</h2>
                <span className="relatorios-badge">{relatoriosFiltrados.length}</span>
              </div>
            </div>

            <div className="relatorios-list">
              {loading ? (
                <div className="p-6 text-center text-xs text-white/40">
                  Carregando relatórios da API...
                </div>
              ) : relatoriosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/40">
                  Nenhum relatório encontrado.
                </div>
              ) : (
                currentRelatorios.map((relatorio) => (
                  <div key={relatorio.id} className="relatorios-row">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#5f52eb]/10 text-[#5f52eb]">
                        <CheckSquare size={16} /> 
                      </div>
                      <div>
                        <p className="relatorios-row__name">
                          Relatório de Tarefas ({relatorio.totalConcluidas} concluídas)
                        </p>
                        <p className="relatorios-row__sub text-emerald-400/80">
                          {relatorio.totalPendentes} pendentes restantes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="relatorios-row__date text-[11px]">
                          {`${formatarParaExibicao(relatorio.periodoInicio)} - ${formatarParaExibicao(relatorio.periodoFim)}`}
                        </span>
                      </div>

                      {/* Menu de Opções Suspenso nos Três Pontinhos */}
                      <div className="relatorios-menu-container relative">
                        <button 
                          className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                          onClick={() => setMenuAbertoId(menuAbertoId === relatorio.id ? null : relatorio.id)}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {menuAbertoId === relatorio.id && (
                          <div className="absolute right-0 mt-1 w-40 rounded-xl bg-[#161832] border border-white/10 shadow-xl z-30 p-1 animate-in fade-in slide-in-from-top-2 duration-150">
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-white/80 hover:text-white hover:bg-[#5f52eb]/20 rounded-lg transition-colors"
                              onClick={() => abrirDetalhesRelatorio(relatorio.id)}
                            >
                              <Eye size={14} className="text-[#a39bf5]" />
                              Abrir relatório
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                              onClick={() => deletarRelatorio(relatorio.id)}
                            >
                              <Trash2 size={14} />
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <footer className="relatorios-pagination">
              <span className="text-xs text-white/40">
                Mostrando {relatoriosFiltrados.length > 0 ? indexOfFirstItem + 1 : 0}-
                {Math.min(indexOfLastItem, relatoriosFiltrados.length)} de {relatoriosFiltrados.length} relatórios
              </span>
              
              <div className="relatorios-pagination__controls">
                <button 
                  className="relatorios-page-arrow disabled:opacity-20"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1
                  return (
                    <button
                      key={pageNumber}
                      className={`relatorios-page-num ${currentPage === pageNumber ? "active" : ""}`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  )
                })}

                <button 
                  className="relatorios-page-arrow disabled:opacity-20"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </footer>
          </section>
        </div>

        {/* COLUNA DA DIREITA (FORMULÁRIO DE GERAÇÃO) */}
        <section className="relatorios-card relatorios-card--form">
          <h2 className="relatorios-form__main-title">Relatório</h2>
          
          <div className="relatorios-form-group">
            <label className="relatorios-label flex items-center justify-between">
              {isEditing ? (
                <input
                  type="text"
                  value={nomeRelatorio}
                  className="bg-[#161832] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none w-full"
                  autoFocus
                  onChange={(e) => setNomeRelatorio(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditing(false)
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span>{nomeRelatorio}</span>
                  <Pencil 
                    size={12} 
                    className="text-white/40 cursor-pointer hover:text-white transition-colors" 
                    onClick={() => setIsEditing(true)}
                  />
                </div>
              )}
            </label>
          </div>

          {/* Bloco DE */}
          <div className="relatorios-form-group mt-4">
            <label className="relatorios-label uppercase tracking-wider font-bold">Início</label>
            <div className="relatorios-date-row">
              <div className="relatorios-date-display">
                <Calendar size={16} className="text-[#5f52eb]" />
                <span>{dataInicio.toLocaleDateString("pt-BR")}</span>
              </div>
              
              <div className="calendario-modal-wrapper">
                <div className="calendario-popover-container">
                  <button 
                    className="relatorios-alterar-btn"
                    onClick={() => setCalendarioAberto(calendarioAberto === "de" ? null : "de")}
                  >
                    Alterar
                  </button>

                  {calendarioAberto === "de" && (
                    <div 
                      className="calendario-popover" 
                      onClick={(e) => {
                        const container = e.currentTarget
                        if ((e.target as HTMLElement).closest("button")) {
                          setTimeout(() => capturarDataDoDOM(container, "de"), 1)
                          e.stopPropagation()
                        }
                      }}
                    >
                      <CalendarWidget key={dataInicio.getTime()} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bloco ATÉ */}
          <div className="relatorios-form-group mt-4">
            <label className="relatorios-label uppercase tracking-wider font-bold">Até</label>
            <div className="relatorios-date-row">
              <div className="relatorios-date-display">
                <Calendar size={16} className="text-[#5f52eb]" />
                <span>{dataFim.toLocaleDateString("pt-BR")}</span>
              </div>
              
              <div className="calendario-modal-wrapper">
                <div className="calendario-popover-container">
                  <button 
                    className="relatorios-alterar-btn"
                    onClick={() => setCalendarioAberto(calendarioAberto === "ate" ? null : "ate")}
                  >
                    Alterar
                  </button>

                  {calendarioAberto === "ate" && (
                    <div 
                      className="calendario-popover" 
                      onClick={(e) => {
                        const container = e.currentTarget
                        if ((e.target as HTMLElement).closest("button")) {
                          setTimeout(() => capturarDataDoDOM(container, "ate"), 1)
                          e.stopPropagation()
                        }
                      }}
                    >
                      <CalendarWidget key={dataFim.getTime()} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button 
            className="relatorios-btn-primary hover:opacity-90 mt-6 w-full"
            onClick={handleAdicionarRelatorio}
          >
            <Plus size={16} />
            Gerar relatório
          </Button>
        </section>

      </div>

      {/* MODAL INTERNO DE DETALHES DO RELATÓRIO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111326] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-white">
            
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div>
                <h3 className="text-sm font-semibold tracking-wide uppercase text-white/50">Resumo de Produtividade</h3>
                <p className="text-xs text-white/30 mt-0.5">ID: {relatorioSelecionado?.id || "Carregando..."}</p>
              </div>
              <button 
                className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg text-xs transition-colors"
                onClick={() => {
                  setModalAberto(false)
                  setRelatorioSelecionado(null)
                }}
              >
                Fechar
              </button>
            </div>

            {loadingDetalhes ? (
              <div className="py-12 text-center text-xs text-white/40">
                Buscando estatísticas no servidor...
              </div>
            ) : relatorioSelecionado && (
              <div className="space-y-5">
                
                {/* Período Analisado */}
                <div className="bg-[#161832] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <Calendar size={18} className="text-[#5f52eb]" />
                  <div className="text-xs">
                    <p className="text-white/40">Período Gerado</p>
                    <p className="font-medium mt-0.5">
                      {formatarParaExibicao(relatorioSelecionado.periodoInicio)} até {formatarParaExibicao(relatorioSelecionado.periodoFim)}
                    </p>
                  </div>
                </div>

                {/* Cards de Métricas (KPIs) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <span className="text-2xl font-bold text-emerald-400 block">
                      {relatorioSelecionado.totalConcluidas}
                    </span>
                    <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider mt-1 block">
                      Concluídas
                    </span>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                    <span className="text-2xl font-bold text-orange-400 block">
                      {relatorioSelecionado.totalPendentes}
                    </span>
                    <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider mt-1 block">
                      Pendentes
                    </span>
                  </div>
                </div>

                {/* Lista de Atividades Diárias (concluidasPorDia) */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2">
                    Histórico Diário de Entregas
                  </h4>
                  <div className="bg-[#161832] border border-white/5 rounded-xl divide-y divide-white/5 max-h-36 overflow-y-auto custom-scrollbar">
                    {Object.keys(relatorioSelecionado.concluidasPorDia).length === 0 ? (
                      <p className="p-4 text-center text-xs text-white/30">
                        Nenhuma tarefa finalizada neste período.
                      </p>
                    ) : (
                      Object.entries(relatorioSelecionado.concluidasPorDia).map(([dataISO, quantidade]) => (
                        <div key={dataISO} className="flex items-center justify-between p-3 text-xs">
                          <span className="text-white/70">{formatarParaExibicao(dataISO)}</span>
                          <span className="font-semibold bg-[#5f52eb]/20 text-[#a39bf5] px-2 py-0.5 rounded-md text-[10px]">
                            {quantidade} {quantidade === 1 ? "tarefa feita" : "tarefas feitas"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Data de Emissão */}
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
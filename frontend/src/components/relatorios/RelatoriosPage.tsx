import { useState } from "react"
import { Search, ListFilter, Trash2, CheckSquare, MoreVertical, Check, Calendar, Pencil, Plus, ChevronLeft, ChevronRight} from "lucide-react"
import { Button } from "#components/ui/button"
import { CalendarWidget } from "#components/dashboard/CalendarWidget"
import { useEffect } from "react"

import "./relatorios.css"

interface Relatorio {
  id: number
  name: string
  category: string
  date: string
  dateInicio?: string
  dateFim?: string
  completed: boolean
}

export function RelatoriosPage() {
  const [search, setSearch] = useState("")
  const [dataInicio, setDataInicio] = useState<Date>(new Date(2026, 4, 25));
  const [dataFim, setDataFim] = useState<Date>(new Date(2026, 4, 28));
  const [calendarioAberto, setCalendarioAberto] = useState<"de" | "ate" | null>(null);

  const [nomeRelatorio, setNomeRelatorio] = useState("Meu Relatório")
  const [isEditing, setIsEditing] = useState(false)

  const [relatorios, setRelatorios] = useState<Relatorio[]>([
    { id: 1, name: "Finalizar Projeto", category: "LIP", date: "24 May 13:00", completed: true }, 
  ])

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Cálculos de Paginação
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  // Esta é a lista fatiada com no máximo 5 itens que você usará no .map
  const currentRelatorios = relatorios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(relatorios.length / ITEMS_PER_PAGE) || 1;

  const toggleCheckbox = (id: number) => {
    setRelatorios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    )
  }

  useEffect(() => {
  const fecharAoClicarFora = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Se o clique não foi no botão "Alterar" e nem dentro do popover do calendário, fecha ele
    if (!target.closest(".relatorios-alterar-btn") && !target.closest(".calendario-popover")) {
      setCalendarioAberto(null);
    }
  };

  document.addEventListener("click", fecharAoClicarFora);
  return () => document.removeEventListener("click", fecharAoClicarFora);
}, []);

const handleAdicionarRelatorio = () => {
  // Evita adicionar se o nome estiver vazio
  if (!nomeRelatorio.trim()) return;

  const novoRelatorio: Relatorio = {
    id: Date.now(), // Gera um ID único baseado no milissegundo atual
    name: nomeRelatorio,
    category: "Geral", // Ou qualquer categoria padrão que desejar
    date: dataInicio.toLocaleDateString("pt-BR"), // Fallback para manter compatibilidade
    dateInicio: dataInicio.toLocaleDateString("pt-BR"),
    dateFim: dataFim.toLocaleDateString("pt-BR"),
    completed: false
  };

  // Adiciona o novo relatório no topo da lista existente
  setRelatorios((prev) => [novoRelatorio, ...prev]);

  // Opcional: Reseta o nome do relatório no input após criar
  setNomeRelatorio("Nome do Relatório");
};


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
              {/* Mostra a quantidade real de itens do array de estado */}
              <span className="relatorios-badge">{relatorios.length}</span>
            </div>
            <div className="relatorios-actions">
              <button className="relatorios-action-btn"><Trash2 size={16} /></button>
              <button className="relatorios-action-btn"><CheckSquare size={16} /></button>
            </div>
          </div>

          <div className="relatorios-list">
            {currentRelatorios.map((relatorio) => (
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
                  {/* Procure por className="relatorios-row__date" dentro do map e troque por: */}
                  <div className="flex flex-col items-end">
                    <span className="relatorios-row__date text-[11px]">
                      {relatorio.dateInicio && relatorio.dateFim ? (
                        `${relatorio.dateInicio} - ${relatorio.dateFim}`
                      ) : (
                        relatorio.date // Mantém o formato antigo caso falte dados
                      )}
                    </span>
                  </div>
                  <button className="text-white/40 hover:text-white">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <footer className="relatorios-pagination">
            <span className="text-xs text-white/40">
              Mostrando {relatorios.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, relatorios.length)} de {relatorios.length} relatórios
            </span>
            
            <div className="relatorios-pagination__controls">
              {/* Seta para Esquerda */}
              <button 
                className="relatorios-page-arrow disabled:opacity-20"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={14} />
              </button>

              {/* Números Dinâmicos das Páginas */}
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`relatorios-page-num ${currentPage === pageNumber ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Seta para Direita */}
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
            
            {/* Wrapper para ancorar o modal em cima do botão */}
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
                      const container = e.currentTarget;
                      const target = e.target as HTMLElement;

                      // 1. Monitora cliques em qualquer botão de dentro do Widget de Calendário
                      if (target.closest("button")) {
                        // Dá um tempo milimétrico (1ms) para o Widget processar o clique e aplicar a classe roxa no novo dia
                        setTimeout(() => {
                          // Procura o botão que ganhou a classe roxa de selecionado no seu widget
                          const botaoSelecionado = container.querySelector("button[class*='bg-[#5a4cf2]']");
                          
                          if (botaoSelecionado instanceof HTMLElement) {
                            const dia = botaoSelecionado.innerText.padStart(2, "0");
                            
                            // Lê o mês e o ano que estão visíveis no cabeçalho do seu calendário agora
                            const textoMes = container.querySelector(".capitalize")?.textContent?.toLowerCase() || "";
                            const ano = container.querySelector(".flex.gap-2 span:last-child")?.textContent || "2026";

                            // Mapeia o texto do cabeçalho para achar o número do mês correto
                            const meses: { [key: string]: string } = {
                              jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", 
                              jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12"
                            };

                            const prefixoMes = textoMes.trim().substring(0, 3);
                            const numeroMes = meses[prefixoMes] || "06";

                            // Alimenta o useState correto da tela com a data capturada por completo e fecha o modal
                            const dataReal = new Date(Number(ano), Number(numeroMes) - 1, Number(dia));
                            setDataInicio(dataReal);
                            setCalendarioAberto(null);
                          }
                        }, 1);

                        // Impede que as setas de mudar de mês fechem o popover antes da hora
                        e.stopPropagation();
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
            {/* Wrapper para ancorar o modal em cima do botão */}
            <div className="calendario-modal-wrapper">
              <div className="calendario-popover-container">
                <button 
                  className="relatorios-alterar-btn"
                  onClick={() => setCalendarioAberto(calendarioAberto === "ate" ? null : "ate")}
                >
                  Alterar
                </button>

                {calendarioAberto === "ate" && (
                  <div className="calendario-popover" onClick={(e) => {
                    const container = e.currentTarget;
                    const target = e.target as HTMLElement;
                    // 1. Monitora cliques em qualquer botão de dentro do Widget de Calendário
                    if (target.closest("button")) {
                      // Dá um tempo milimétrico (1ms) para o Widget processar o clique e aplicar a classe roxa no novo dia
                      setTimeout(() => {
                        // Procura o botão que ganhou a classe roxa de selecionado no seu widget
                        const botaoSelecionado = container.querySelector("button[class*='bg-[#5a4cf2]']");
                        
                        if (botaoSelecionado instanceof HTMLElement) {
                          const dia = botaoSelecionado.innerText.padStart(2, "0");
                          
                          // Lê o mês e o ano que estão visíveis no cabeçalho do seu calendário agora
                          const textoMes = container.querySelector(".capitalize")?.textContent?.toLowerCase() || "";
                          const ano = container.querySelector(".flex.gap-2 span:last-child")?.textContent || "2026";

                          // Mapeia o texto do cabeçalho para achar o número do mês correto
                          const meses: { [key: string]: string } = {
                            jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", 
                            jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12"
                          };

                          const prefixoMes = textoMes.trim().substring(0, 3);
                          const numeroMes = meses[prefixoMes] || "06";

                          // Alimenta o useState correto da tela com a data capturada por completo
                            const dataReal = new Date(Number(ano), Number(numeroMes) - 1, Number(dia));
                            setDataFim(dataReal);
                            setCalendarioAberto(null); 
                          
                        }
                      }, 1);

                      // Impede que as setas de mudar de mês fechem o popover antes da hora
                      e.stopPropagation();
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

      {/* Altere o seu botão para disparar a função criada */}
        <Button 
          className="relatorios-btn-primary hover:opacity-90"
          onClick={handleAdicionarRelatorio}
        >
          <Plus size={16} />
          Gerar relatório
        </Button>

      </section>

    </div>
  </div>
 )
}
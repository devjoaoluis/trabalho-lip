import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { Label } from "#components/ui/label"
import type { CreateTaskPayload, Prioridade, StatusTarefa } from "../../../service/task"
import "./tasks.css"

interface NewTaskModalProps {
  onClose: () => void
  onSubmit: (payload: CreateTaskPayload) => Promise<void>
}

export function NewTaskModal({ onClose, onSubmit }: NewTaskModalProps) {
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [prioridade, setPrioridade] = useState<Prioridade>("MEDIA")
  const [status, setStatus] = useState<StatusTarefa>("PENDENTE")
  const [dataLimite, setDataLimite] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setIsSaving(true)
    setSubmitError(null)
    try {
      await onSubmit({
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        prioridade,
        status,
        dataLimite: dataLimite || undefined,
      })
      onClose()
    } catch {
      setSubmitError("Erro ao criar tarefa. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="tasks-modal-overlay" role="dialog" aria-modal="true" aria-label="Nova tarefa">
      <div className="tasks-modal">
        <div className="flex items-center justify-between mb-4">
          <h2 className="tasks-modal__title">Nova Tarefa</h2>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/10" onClick={onClose} aria-label="Fechar modal">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} noValidate aria-label="Formulário de nova tarefa">
          <div className="task-field">
            <Label className="task-field__label" htmlFor="new-titulo">Título *</Label>
            <Input id="new-titulo" className="task-field__input" placeholder="Título da tarefa" value={titulo} onChange={(e) => setTitulo(e.target.value)} required disabled={isSaving} />
          </div>
          <div className="task-field">
            <Label className="task-field__label" htmlFor="new-desc">Descrição</Label>
            <textarea id="new-desc" className="task-field__textarea focus-visible:ring-2 focus-visible:ring-[#7c6ff7]" placeholder="Descrição opcional..." rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} disabled={isSaving} />
          </div>
          <div className="flex gap-3">
            <div className="task-field flex-1">
              <Label className="task-field__label" htmlFor="new-prioridade">Prioridade</Label>
              <select id="new-prioridade" className="task-field__select focus-visible:ring-2 focus-visible:ring-[#7c6ff7]" value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)} disabled={isSaving}>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixo</option>
              </select>
            </div>
            <div className="task-field flex-1">
              <Label className="task-field__label" htmlFor="new-status">Status</Label>
              <select id="new-status" className="task-field__select focus-visible:ring-2 focus-visible:ring-[#7c6ff7]" value={status} onChange={(e) => setStatus(e.target.value as StatusTarefa)} disabled={isSaving}>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDA">Concluído</option>
              </select>
            </div>
          </div>
          <div className="task-field">
            <Label className="task-field__label" htmlFor="new-data">Data limite</Label>
            <Input id="new-data" type="date" className="task-field__input" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} disabled={isSaving} />
          </div>
          {submitError && <p className="text-xs text-red-400 mb-3" role="alert">{submitError}</p>}
          <div className="task-edit-panel__actions mt-2">
            <Button type="button" variant="ghost" className="tasks-btn-cancel hover:bg-white/10" onClick={onClose} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" className="tasks-btn-save hover:bg-[#6a5fe0] active:bg-[#5c52cc]" disabled={isSaving || !titulo.trim()}>{isSaving ? "Criando…" : "Criar Tarefa"}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

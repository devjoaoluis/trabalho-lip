import { useState, useEffect, useRef } from "react"
import { ImageUp, Pencil, CircleAlert, User, Loader2, Trash2 } from "lucide-react"
import { Button } from "#components/ui/button"
import { Input } from "#components/ui/input"
import { Label } from "#components/ui/label"
import { useCurrentUser } from "#hooks/useCurrentUser"
import { updateUser, updateProfilePhoto, removeProfilePhoto } from "../../../service/user"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import "./profile.css"

type AvatarColor = "green" | "pink" | "blue" | "yellow"

const COLOR_OPTIONS: AvatarColor[] = ["green", "pink", "blue", "yellow"]

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "dd/MM/yyyy", { locale: ptBR })
  } catch {
    return "--/--/----"
  }
}

export function ProfilePage() {
  const { user, isLoading, refetch } = useCurrentUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [activeColor, setActiveColor] = useState<AvatarColor>("blue")

  // Prévia local da foto antes de ser enviada
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  // Preenche os campos quando o usuário carrega
  useEffect(() => {
    if (!user) return

    // O campo nome pode conter a cor codificada: "João|blue"
    if (user.nome.includes("|")) {
      const [nomeLimpo, cor] = user.nome.split("|")
      setNome(nomeLimpo)
      if (COLOR_OPTIONS.includes(cor as AvatarColor)) {
        setActiveColor(cor as AvatarColor)
      }
    } else {
      setNome(user.nome)
    }

    setEmail(user.email)
    // Limpa a prévia quando os dados do servidor chegam
    setPhotoPreview(null)
  }, [user])

  async function handleSave() {
    if (!user) return
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await updateUser(user.id, {
        nome: `${nome}|${activeColor}`,
        email,
      })
      await refetch()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError("Erro ao salvar as alterações. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  async function handleRemovePhoto() {
    setIsRemovingPhoto(true)
    setPhotoError(null)
    try {
      await removeProfilePhoto()
      setPhotoPreview(null)
      await refetch()
    } catch {
      setPhotoError("Erro ao remover a foto. Tente novamente.")
    } finally {
      setIsRemovingPhoto(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Mostra prévia local imediatamente
    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
    setPhotoError(null)

    setIsUploadingPhoto(true)
    try {
      await updateProfilePhoto(file)
      await refetch()
    } catch {
      setPhotoError("Erro ao enviar a foto. Tente novamente.")
      setPhotoPreview(null)
    } finally {
      setIsUploadingPhoto(false)
      // Limpa o input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (isLoading) {
    return (
      <div className="profile-page flex items-center justify-center">
        <span className="text-white/40 text-sm">Carregando perfil…</span>
      </div>
    )
  }

  const criadoEm = user?.criadoEm ? formatDate(user.criadoEm) : "--/--/----"
  const currentPhoto = photoPreview ?? user?.fotoUrl ?? null

  return (
    <main className="profile-page">
      <div className="profile-container">
        {/* ── Card hero — avatar + cores ── */}
        <section className="dashboard-card" aria-label="Avatar do perfil">
          <div className="profile-hero__header">
            <User size={16} aria-hidden="true" />
            <p className="profile-hero__title">Perfil</p>
            <p className="profile-hero__subtitle">criado em {criadoEm}</p>
          </div>

          {/* Avatar — foto real ou iniciais com cor */}
          <div className="profile-avatar__wrapper">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={nome}
                className="profile-avatar profile-avatar--photo"
              />
            ) : (
              <div
                className={`profile-avatar profile-avatar--${activeColor}`}
                aria-hidden="true"
              >
                {nome ? getInitials(nome) : "U"}
              </div>
            )}

            {/* Spinner sobre o avatar durante o upload */}
            {isUploadingPhoto && (
              <div className="profile-avatar__uploading" aria-label="Enviando foto…">
                <Loader2 size={28} className="animate-spin text-white" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Seletor de cor — só visível quando não há foto */}
          {!currentPhoto && (
            <div className="profile-colors" aria-label="Cor do avatar">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`profile-color profile-color--${color} ${activeColor === color ? "is-active" : ""}`}
                  aria-label={`Cor ${color}`}
                  aria-pressed={activeColor === color}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>
          )}

          {/* Botão de upload */}
          <button
            type="button"
            className="profile-upload-btn"
            onClick={handleUploadClick}
            disabled={isUploadingPhoto}
            aria-label="Enviar foto de perfil"
          >
            {isUploadingPhoto ? (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <ImageUp size={14} aria-hidden="true" />
            )}
            {isUploadingPhoto ? "Enviando…" : "Upload de imagem"}
          </button>

          {/* Botão de remover foto — só visível quando há foto */}
          {currentPhoto && (
            <button
              type="button"
              className="profile-remove-photo-btn"
              onClick={handleRemovePhoto}
              disabled={isRemovingPhoto || isUploadingPhoto}
              aria-label="Remover foto de perfil"
            >
              {isRemovingPhoto ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 size={14} aria-hidden="true" />
              )}
              {isRemovingPhoto ? "Removendo…" : "Remover foto"}
            </button>
          )}

          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-hidden="true"
            onChange={handleFileChange}
          />

          {photoError && (
            <p className="text-xs text-red-400 text-center mt-2" role="alert" aria-live="polite">
              {photoError}
            </p>
          )}
        </section>

        {/* ── Card Sobre sua Conta ── */}
        <section className="dashboard-card flex gap-3" aria-label="Sobre sua conta">
          <h2 className="profile-account-card__title">
            <CircleAlert size={16} aria-hidden="true" />
            Sobre sua Conta
          </h2>
          <p className="text-sm text-white/40 mb-6">Aqui você pode visualizar e alterar suas informações de nome e email que estão registrados na conta.</p>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Label htmlFor="nome" className="profile-form__label">
                Nome de Usuário
                <Pencil size={14} strokeWidth={3.5} className="text-white/80" aria-hidden="true" />
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="profile-form__input"
                aria-label="Nome de usuário"
              />
            </div>

            <div className="flex flex-col gap-4">
              <Label htmlFor="email" className="profile-form__label">
                E-mail
                <Pencil size={14} strokeWidth={3.5} className="text-white/80" aria-hidden="true" />
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="profile-form__input"
                aria-label="E-mail"
              />
            </div>
          </div>
        </section>

        {/* ── Ações ── */}
        <div className="profile-actions">
          {saveError && (
            <p className="text-sm text-red-400 mb-2" role="alert" aria-live="polite">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-sm text-emerald-400 mb-2" role="status" aria-live="polite">
              Perfil atualizado com sucesso!
            </p>
          )}
          <Button
            type="button"
            className="profile-form__btn profile-form__btn--save"
            disabled={isSaving}
            onClick={handleSave}
            aria-label="Salvar alterações do perfil"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1" aria-hidden="true" />
                Salvando…
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </div>
    </main>
  )
}

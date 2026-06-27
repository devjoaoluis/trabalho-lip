import { useState, useEffect } from "react"
import { Image, Pencil, CircleAlert, User } from "lucide-react"

import "./profile.css"

interface UserProfile {
  id?: string
  email: string
  nome: string
}

const defaultProfile: UserProfile = {
  id: "",
  nome: "",
  email: "",
}

export function ProfilePage() {
  const [formData, setFormData] = useState<UserProfile>(defaultProfile)
  const [activeColor, setActiveColor] = useState("blue")
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("meu_token_jwt")
  const API_URL = "http://localhost:3300"

  useEffect(() => {
    async function loadUserData() {
      try {
        const response = await fetch(`${API_URL}/users/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        if (!response.ok) {
          throw new Error("Erro ao carregar dados do usuário")
        }

        const data = await response.json()
        
        let nomeLimpo = data.nome || ""
        let corSalva = "blue"

        if (nomeLimpo.includes("|")) {
          const partes = nomeLimpo.split("|")
          nomeLimpo = partes[0]
          corSalva = partes[1] || "blue"
        }
        
        setFormData({
          id: data.id,
          nome: nomeLimpo,
          email: data.email
        })
        setActiveColor(corSalva)
      } catch (error) {
        console.error(error)
        alert("Não foi possível carregar as informações do perfil. Verifique seu login.")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadUserData()
    } else {
      setLoading(false)
    }
  }, [token])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSave() {
    if (!formData.id) {
      alert("ID do usuário não encontrado.")
      return
    }

    try {
      const nomeComCor = `${formData.nome}|${activeColor}`

      const response = await fetch(`${API_URL}/users/${formData.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nomeComCor,
          email: formData.email
        })
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar o perfil no servidor")
      }
      
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar as alterações do perfil.")
    }
  }

  if (loading) {
    return <div className="loading">Carregando perfil...</div>
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <section className="profile-hero">
          <div className="profile-hero__header">
            <User size={16} />
            <p className="profile-hero__title">Perfil</p>
            <p className="profile-hero__subtitle">Conectado ao Servidor</p>
          </div>

          <div className={`profile-avatar profile-avatar--${activeColor}`}>
            {formData.nome 
              ? formData.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
              : "User"
            }
          </div>

          <button type="button" className="profile-upload-btn">
            <Image size={14} className="text-white/70" />
            Upload de imagem
          </button>

          <div className="profile-colors" aria-label="Cores do avatar">
            <button
              type="button"
              className={`profile-color profile-color--green ${activeColor === "green" ? "is-active" : ""}`}
              onClick={() => setActiveColor("green")}
            />
            <button
              type="button"
              className={`profile-color profile-color--pink ${activeColor === "pink" ? "is-active" : ""}`}
              onClick={() => setActiveColor("pink")}
            />
            <button
              type="button"
              className={`profile-color profile-color--blue ${activeColor === "blue" ? "is-active" : ""}`}
              onClick={() => setActiveColor("blue")}
            />
            <button
              type="button"
              className={`profile-color profile-color--yellow ${activeColor === "yellow" ? "is-active" : ""}`}
              onClick={() => setActiveColor("yellow")}
            />
          </div>
        </section>

        <section className="profile-account-card">
          <h2 className="profile-account-card__title">
            <CircleAlert size={16} />
            Sobre sua Conta
          </h2>

          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="profile-form__group">
              <label htmlFor="nome" className="profile-form__label">
                Nome de Usuário
                <Pencil size={14} strokeWidth={3.5} className="text-white/80" />
              </label>

              <input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="profile-form__input"
              />
            </div>

            <div className="profile-form__group">
              <label htmlFor="email" className="profile-form__label">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="profile-form__input"
              />
            </div>
          </form>
        </section>

        <div className="profile-actions">
          <button
            type="button"
            className="profile-form__btn profile-form__btn--save"
            onClick={handleSave}
          >
            Salvar
          </button>
        </div>
      </div>
    </main>
  )
}

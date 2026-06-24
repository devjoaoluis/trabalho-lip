import { useState } from "react"
import { Image, Pencil, CircleAlert, User } from "lucide-react"

import "./profile.css"

interface UserProfile {
  email: string
  username: string
  fullName: string
}

const defaultProfile: UserProfile = {
  fullName: "Geovana Evlys",
  email: "geovana@gmail.com",
  username: "Geovana",
}

export function ProfilePage() {
 
const [formData, setFormData] = useState<UserProfile>(defaultProfile)
const [activeColor, setActiveColor] = useState("blue")

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
   
const { name, value } = e.target

setFormData((prev) => ({
        ...prev,
        [name]: value,
    }))
}


function handleSave() {
    console.log("Salvar perfil", formData)
}


return (
    <main className="profile-page">


        <div className="profile-container">
        <section className="profile-hero">
          <div className="profile-hero__header">
            <User size={16} />
            <p className="profile-hero__title">
              Perfil
            </p>
            <p className="profile-hero__subtitle">
              código em 0000/0000
            </p>
          </div>


          <div className="profile-avatar">
            {formData.fullName.split(" ").slice(0, 2).map((name) => name[0]).join("")}
          </div>


          <button
            type="button"
            className="profile-upload-btn"
          >
            <Image size={14} className="text-white/70" />
            Upload de imagem
          </button>


          <div
            className="profile-colors"
            aria-label="Cores do avatar"
          >
            <button
              type="button"
              className={`profile-color profile-color--green ${
                activeColor === "green"
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                setActiveColor("green")
              }
            />


            <button
              type="button"
              className={`profile-color profile-color--pink ${
                activeColor === "pink"
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                setActiveColor("pink")
              }
            />


            <button
              type="button"
              className={`profile-color profile-color--blue ${
                activeColor === "blue"
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                setActiveColor("blue")
              }
            />


            <button
              type="button"
              className={`profile-color profile-color--yellow ${
                activeColor === "yellow"
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                setActiveColor("yellow")
              }
            />
          </div>
        </section>


        <section className="profile-account-card">
          <h2 className="profile-account-card__title">
            <CircleAlert size={16} />
            Sobre sua Conta
          </h2>


          <form
            className="profile-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="profile-form__group">
              <label
                htmlFor="username"
                className="profile-form__label"
              >
                Nome de Usuário
                <Pencil size={14} strokeWidth={3.5} className="text-white/80" />
              </label>


              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="profile-form__input"
              />
            </div>


            <div className="profile-form__group">
              <label
                htmlFor="email"
                className="profile-form__label"
              >
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


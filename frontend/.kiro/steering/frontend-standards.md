---
inclusion: always
---

# Padrões de Desenvolvimento Frontend – Task Lip

Este documento define os padrões obrigatórios de código, nomenclatura e estilo para o projeto **Task Lip**. Sempre siga estas regras ao criar ou modificar componentes.

---

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + Vite |
| Linguagem | TypeScript (strict) |
| Estilo | TailwindCSS v4 + CSS Modules via `@apply` |
| Componentes base | shadcn (radix-nova style) |
| Ícones | lucide-react |
| Fonte | Geist Variable |
| Roteamento | React Router v7 (`react-router-dom`) |
| HTTP | Axios (instância centralizada em `service/api.ts`) |

---

## 2. Estrutura de Pastas

```
src/
├── components/
│   ├── ui/                  # Primitivos shadcn (Button, Input, Label…)
│   └── <feature>/           # Componentes de feature (login/, register/, dashboard/…)
│       ├── FeaturePage.tsx
│       └── feature.css      # Estilos BEM da feature
├── hooks/                   # Custom hooks (useLogin, useRegister, …)
├── lib/
│   └── utils.ts             # cn() helper
├── pages/                   # Wrappers de rota — um arquivo por rota
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── router/
│   ├── AppRouter.tsx        # BrowserRouter + todas as rotas
│   ├── AuthGuard.tsx        # AuthGuard e GuestGuard
│   └── routes.ts            # Constante ROUTES (fonte única de verdade)
├── App.tsx                  # Apenas monta <AppRouter />
└── index.css                # Tokens globais Tailwind/shadcn
service/                     # Camada HTTP — fora de src/
├── api.ts                   # Instância axios base
├── auth.ts                  # Endpoints de autenticação
├── register.ts              # Endpoints de cadastro
└── <recurso>.ts             # Um arquivo por recurso da API
```

---

## 3. Roteamento

### Constante de rotas

Todas as rotas ficam em `src/router/routes.ts`. **Nunca use strings literais** de caminho em `<Link>`, `navigate()` ou `<Route>`.

```ts
// src/router/routes.ts
export const ROUTES = {
  LOGIN:     "/login",
  REGISTER:  "/register",
  DASHBOARD: "/dashboard",
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
```

Para adicionar uma nova rota:
1. Declare a constante em `ROUTES`.
2. Crie o page wrapper em `src/pages/NovaRota.tsx`.
3. Registre em `AppRouter.tsx` dentro do guard correto.

### Estrutura do AppRouter

```tsx
// src/router/AppRouter.tsx
<BrowserRouter>
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* Públicas — redireciona para dashboard se já autenticado */}
      <Route element={<GuestGuard />}>
        <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Protegidas — exige token no localStorage */}
      <Route element={<AuthGuard />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        {/* Novas rotas autenticadas aqui */}
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  </Suspense>
</BrowserRouter>
```

- Use **lazy loading** para todos os pages: `const Page = lazy(() => import("#pages/Page"))`.
- `<Suspense fallback={<PageLoader />}>` envolve todas as rotas.

### Guards

| Guard | Comportamento |
|---|---|
| `AuthGuard` | Se **sem** token → redireciona para `/login` |
| `GuestGuard` | Se **com** token → redireciona para `/dashboard` |

```tsx
// AuthGuard — rotas autenticadas
export function AuthGuard() {
  const token = localStorage.getItem("accessToken")
  return token ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
}

// GuestGuard — rotas públicas
export function GuestGuard() {
  const token = localStorage.getItem("accessToken")
  return token ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />
}
```

### Navegação programática e links

```tsx
// Link declarativo
import { Link } from "react-router-dom"
import { ROUTES } from "../../router/routes"

<Link to={ROUTES.REGISTER}>Criar Conta</Link>

// Navegação imperativa (após submit de form)
import { useNavigate } from "react-router-dom"

const navigate = useNavigate()
navigate(ROUTES.DASHBOARD, { replace: true })

// Passando estado entre rotas (ex: feedback pós-cadastro)
navigate(ROUTES.LOGIN, { replace: true, state: { registered: true } })
```

---

## 4. Camada de serviços (HTTP)

### Instância base

```ts
// service/api.ts
import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3300",
})

export default api
```

### Padrão de um arquivo de serviço

Cada recurso da API tem seu próprio arquivo em `service/`. Sempre exporte as interfaces de request e response.

```ts
// service/<recurso>.ts
import api from "./api"

export interface <Recurso>Credentials { … }
export interface <Recurso>Response    { … }

export async function <acao><Recurso>(
  payload: <Recurso>Credentials
): Promise<<Recurso>Response> {
  const { data } = await api.post<<Recurso>Response>("/rota", payload)
  return data
}
```

### Serviços existentes

| Arquivo | Método | Endpoint | Body | Resposta |
|---|---|---|---|---|
| `service/auth.ts` | `loginUser()` | `POST /auth/login` | `{ email, password }` | `{ accessToken }` |
| `service/register.ts` | `registerUser()` | `POST /auth/register` | `{ nome, email, senha }` | `201` sem corpo |

> **Atenção aos nomes dos campos:** a API de login usa `password` (inglês) e a de cadastro usa `nome` e `senha` (português). Respeite sempre o contrato do Swagger.

---

## 5. Custom Hooks

Cada operação assíncrona tem seu próprio hook em `src/hooks/`. O padrão é sempre:

```ts
// src/hooks/use<Feature>.ts
export function use<Feature>() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function submit(payload: <Payload>, onSuccess?: () => void) {
    setIsLoading(true)
    setError(null)
    try {
      await service<Feature>(payload)
      onSuccess?.()
    } catch (err: unknown) {
      const status = getHttpStatus(err)
      if (status === 400) setError("Mensagem específica do erro 400.")
      else if (status === 401) setError("Mensagem de não autorizado.")
      else setError("Ocorreu um erro. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, submit }
}
```

- `onSuccess` é um callback opcional — o redirecionamento fica no componente, não no hook.
- Use a helper `getHttpStatus(err)` (copiada de `useLogin.ts`) para extrair o status HTTP sem depender do tipo do Axios diretamente.
- Hooks existentes: `useLogin`, `useRegister`.

### Tratamento de erros HTTP por status

| Status | Mensagem padrão |
|---|---|
| 400 | Mensagem específica do recurso (ex: "Dados inválidos ou e-mail já cadastrado.") |
| 401 | "E-mail ou senha inválidos." |
| outros | "Ocorreu um erro. Tente novamente mais tarde." |

---

## 6. Padrão de Pages e Components

### Pages (`src/pages/`)

São wrappers finos — apenas importam e renderizam o componente de feature. Permitem lazy loading sem lógica extra.

```tsx
// src/pages/LoginPage.tsx
import { LoginPage as LoginPageComponent } from "#components/login/LoginPage"

export default function LoginPage() {
  return <LoginPageComponent />
}
```

### Components de feature (`src/components/<feature>/`)

Contêm toda a lógica e markup da tela. Estrutura interna padrão:

```
<feature>/
├── FeaturePage.tsx    # Componente exportado, montado pelo page wrapper
└── feature.css        # Estilos BEM exclusivos da feature
```

Toda feature de tela segue o layout de duas colunas (formulário + hero):

```tsx
export function FeaturePage() {
  return (
    <main className="feature-page flex-col lg:flex-row">
      <aside className="feature-page__form-col w-full lg:w-[55%]" aria-label="…">
        <FeatureForm />
      </aside>
      <section className="feature-page__hero flex-1 lg:px-16 lg:py-12" aria-label="…">
        <TaskLipLogo />
        <h2 className="feature-page__headline">…</h2>
        <p className="feature-page__cta">
          Link para outra rota via <Link to={ROUTES.X}>…</Link>
        </p>
      </section>
    </main>
  )
}
```

---

## 7. Nomenclatura BEM

Use **BEM** (Block\_\_Element--Modifier) em todas as classes CSS customizadas.

### Regras

- **Bloco**: identifica o componente raiz. Ex.: `login-page`, `register-card`, `dashboard-board`.
- **Elemento**: parte interna do bloco, separado por `__`. Ex.: `login-card__title`.
- **Modificador**: variação, separado por `--`. Ex.: `login-form__field--password`.

```css
/* ✅ correto */
.login-page { … }
.login-page__hero { … }
.login-card__title { … }
.login-form__field--password { … }

/* ❌ errado */
.loginCard { … }
.login_card_title { … }
.card-title { … }
```

---

## 8. CSS: `@apply` com Tailwind v4

Estilos BEM ficam em arquivos `.css` dedicados por feature.

> **Regra obrigatória v4:** Todo `.css` que não é o entry point **deve** declarar `@reference "../../index.css";` no topo.

> **Regra obrigatória v4:** Variantes (`lg:`, `hover:`, `sm:`, `active:`, `focus-visible:`) **não funcionam dentro de `@apply`**. Sempre coloque variantes no `className` do TSX.

```css
/* feature.css */
@reference "../../index.css";

.feature-form__submit {
  @apply w-full h-11 rounded-lg bg-[#7c6ff7] text-white font-semibold transition-colors cursor-pointer;
}
```

```tsx
{/* variantes sempre no TSX */}
<Button className="feature-form__submit hover:bg-[#6a5fe0] active:bg-[#5c52cc]" />
```

---

## 9. Tokens de cor do projeto

| Token | Valor | Uso |
|---|---|---|
| `brand-purple` | `#7c6ff7` | Cor primária (CTAs, links, foco) |
| `brand-purple-hover` | `#6a5fe0` | Hover do primário |
| `brand-purple-active` | `#5c52cc` | Active/press |
| `page-bg` | `#0d0f1e` | Fundo da página dark |
| `card-bg` | `white` | Fundo dos cards |

---

## 10. Componentes shadcn

- Primitivos ficam em `src/components/ui/`. Disponíveis: `Button`, `Input`, `Label`.
- **Não modifique** o estilo padrão do primitivo. Sobrescreva via `className` ou classe BEM no wrapper.
- Use sempre `cn()` de `#lib/utils` para classes condicionais.

```tsx
import { cn } from "#lib/utils"

<Button className={cn("feature-form__submit", isLoading && "opacity-60")} />
```

---

## 11. Responsividade

**Mobile-first**: sem prefixo para mobile, `lg:` para desktop.

| Prefixo | Largura |
|---|---|
| `sm:` | ≥ 640 px |
| `md:` | ≥ 768 px |
| `lg:` | ≥ 1024 px |
| `xl:` | ≥ 1280 px |

Layouts de duas colunas: `flex-col` no mobile → `lg:flex-row` (ou `lg:flex-row-reverse`) no desktop.

---

## 12. Acessibilidade

- Todo `<input>` deve ter `aria-label` ou `<label htmlFor>`.
- Botões icon-only devem ter `aria-label`.
- Elementos decorativos recebem `aria-hidden="true"`.
- Links e botões devem ter `focus-visible` com `ring` visível (`focus-visible:ring-2 focus-visible:ring-[#7c6ff7]`).
- Use `<main>`, `<section>`, `<aside>`, `<header>` semanticamente.
- Mensagens de erro usam `role="alert"` e `aria-live="polite"`.

---

## 13. TypeScript

- Sem `any` — use tipos explícitos ou `unknown`.
- Props via `React.ComponentProps<"element">` ou interface dedicada.
- Eventos tipados: `React.FormEvent`, `React.ChangeEvent<HTMLInputElement>`, etc.

---

## 14. Path Aliases

Aliases configurados em `package.json#imports` e `vite.config.ts`:

| Alias | Aponta para |
|---|---|
| `#components/*` | `src/components/*.tsx` |
| `#lib/*` | `src/lib/*.ts` |
| `#hooks/*` | `src/hooks/*.ts` |
| `#pages/*` | `src/pages/*.tsx` |

```ts
import { Button }      from "#components/ui/button"
import { cn }          from "#lib/utils"
import { useLogin }    from "#hooks/useLogin"
import LoginPage       from "#pages/LoginPage"
```

Nunca use caminhos relativos longos como `../../../components/ui/button`.

> **Exceção:** imports de `service/` e `router/` ainda usam caminho relativo curto (`../../router/routes`, `../../service/auth`) por estarem fora de `src/`. Isso é esperado e aceitável.

---

## 15. Checklist para criar uma nova tela

Ao implementar qualquer tela nova, siga esta ordem:

1. **Serviço** → crie `service/<recurso>.ts` com interfaces e função HTTP.
2. **Hook** → crie `src/hooks/use<Feature>.ts` seguindo o padrão da seção 5.
3. **CSS** → crie `src/components/<feature>/feature.css` com BEM + `@reference`.
4. **Componente** → crie `src/components/<feature>/FeaturePage.tsx`.
5. **Page wrapper** → crie `src/pages/FeaturePage.tsx` (import + re-export default).
6. **Rota** → adicione a constante em `ROUTES` e registre em `AppRouter.tsx` no guard correto.
7. **Links** → substitua qualquer `<a href="#">` por `<Link to={ROUTES.X}>`.

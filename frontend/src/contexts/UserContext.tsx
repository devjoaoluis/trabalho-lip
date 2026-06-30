import { createContext, useContext, type ReactNode } from "react"
import { useCurrentUser } from "#hooks/useCurrentUser"
import type { UserProfile } from "../../service/user"

interface UserContextValue {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const value = useCurrentUser()

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUserContext must be used inside <UserProvider>")
  return ctx
}

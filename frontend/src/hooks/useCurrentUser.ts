import { useState, useEffect } from "react"
import { getCurrentUser, type UserProfile } from "../../service/user"

interface UseCurrentUserReturn {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchUser() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getCurrentUser()
      setUser(data)
    } catch {
      setError("Não foi possível carregar os dados do usuário.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchUser()
  }, [])

  return { user, isLoading, error, refetch: fetchUser }
}

import { useState } from "react"
import { resetPassword } from "../../service/resetPassword"
import type { ResetPasswordPayload } from "../../service/resetPassword"

interface UseResetPasswordReturn {
  isLoading: boolean
  error: string | null
  submit: (payload: ResetPasswordPayload, onSuccess?: () => void) => Promise<void>
}

export function useResetPassword(): UseResetPasswordReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(payload: ResetPasswordPayload, onSuccess?: () => void) {
    setIsLoading(true)
    setError(null)

    try {
      await resetPassword(payload)
      onSuccess?.()
    } catch (err: unknown) {
      const status = getHttpStatus(err)

      if (status === 400) {
        setError("Token inválido ou expirado.")
      } else if (status === 422) {
        setError("A senha não atende aos requisitos mínimos.")
      } else {
        setError("Ocorreu um erro. Tente novamente mais tarde.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, submit }
}

/** Extrai o status HTTP de um erro do Axios sem depender do tipo diretamente. */
function getHttpStatus(err: unknown): number | null {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "status" in err.response
  ) {
    return err.response.status as number
  }
  return null
}

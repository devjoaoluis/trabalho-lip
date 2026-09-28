import { useState } from "react"
import { forgotPassword } from "../../service/forgotPassword"
import type { ForgotPasswordPayload } from "../../service/forgotPassword"

interface UseForgotPasswordReturn {
  isLoading: boolean
  error: string | null
  success: boolean
  submit: (payload: ForgotPasswordPayload, onSuccess?: () => void) => Promise<void>
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function submit(payload: ForgotPasswordPayload, onSuccess?: () => void) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await forgotPassword(payload)
      setSuccess(true)
      onSuccess?.()
    } catch (err: unknown) {
      const status = getHttpStatus(err)

      if (status === 404) {
        setError("Nenhuma conta encontrada com esse e-mail.")
      } else if (status === 400) {
        setError("Informe um e-mail válido.")
      } else {
        setError("Ocorreu um erro. Tente novamente mais tarde.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, success, submit }
}

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

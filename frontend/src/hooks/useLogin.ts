import { useState } from "react";
import { loginUser } from "../../service/auth";
import type { LoginCredentials } from "../../service/auth";

interface UseLoginReturn {
  isLoading: boolean;
  error: string | null;
  submit: (credentials: LoginCredentials, onSuccess?: () => void) => Promise<void>;
}

export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(credentials: LoginCredentials, onSuccess?: () => void) {
    setIsLoading(true);
    setError(null);

    try {
      const { accessToken } = await loginUser(credentials);
      localStorage.setItem("accessToken", accessToken);
      onSuccess?.();
    } catch (err: unknown) {
      const status = getHttpStatus(err);

      if (status === 400) {
        setError("Preencha todos os campos corretamente.");
      } else if (status === 401) {
        setError("E-mail ou senha inválidos.");
      } else {
        setError("Ocorreu um erro. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, submit };
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
    return err.response.status as number;
  }
  return null;
}

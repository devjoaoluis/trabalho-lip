import { useState } from "react";
import { registerUser } from "../../service/register";

interface RegisterFields {
  nome: string;
  email: string;
  senha: string;
}

interface UseRegisterReturn {
  isLoading: boolean;
  error: string | null;
  submit: (fields: RegisterFields, onSuccess?: () => void) => Promise<void>;
}

export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(fields: RegisterFields, onSuccess?: () => void) {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser(fields);
      onSuccess?.();
    } catch (err: unknown) {
      const status = getHttpStatus(err);

      if (status === 400) {
        setError("Dados inválidos ou e-mail já cadastrado.");
      } else {
        setError("Ocorreu um erro. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, submit };
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
    return err.response.status as number;
  }
  return null;
}

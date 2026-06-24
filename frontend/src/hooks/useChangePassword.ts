import { useState } from "react";
import { changePassword } from "../../service/settings";
import type { ChangePasswordPayload } from "../../service/settings";

interface UseChangePasswordReturn {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  submit: (payload: ChangePasswordPayload, onSuccess?: () => void) => Promise<void>;
}

export function useChangePassword(): UseChangePasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(payload: ChangePasswordPayload, onSuccess?: () => void) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await changePassword(payload);
      setSuccess("Senha alterada com sucesso.");
      onSuccess?.();
    } catch (err: unknown) {
      const status = getHttpStatus(err);
      if (status === 401) {
        setError("Senha atual incorreta.");
      } else if (status === 400) {
        setError("Verifique os campos e tente novamente.");
      } else {
        setError("Ocorreu um erro. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, success, submit };
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

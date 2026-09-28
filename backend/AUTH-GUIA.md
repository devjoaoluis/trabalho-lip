Metodo: Recuperar Senha (Forgot Password)
URL: POST /auth/forgot-password
{
  "email": "guilherme@email.com"
}

Metodo Redefinir Senha (Reset Password)
URL: POST /auth/reset-password
{
  "token": "token_hexadecimal_recebido_no_email",
  "newPassword": "NovaSenha123!"
}
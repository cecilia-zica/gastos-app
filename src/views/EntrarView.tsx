import { LogIn } from "lucide-react";
import logoWert from "../assets/logo-wert.webp";

interface Props {
  onSignIn: () => void;
  error: string | null;
}

/** Tela de login — unico jeito de entrar e com Google, dados ficam no Firestore. */
export default function EntrarView({ onSignIn, error }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[460px] flex-col items-center justify-center px-6 text-center">
      <img
        src={logoWert}
        alt="wert"
        className="rise mb-4 h-14 w-auto stamp drop-shadow-[0_3px_4px_rgba(36,55,31,.35)]"
      />
      <p className="rise mt-1 text-[14px] text-muted" style={{ animationDelay: "110ms" }}>
        entra com sua conta pra ver seus gastos em qualquer aparelho
      </p>

      <button
        type="button"
        onClick={onSignIn}
        className="rise mt-8 flex w-full items-center justify-center gap-2.5 rounded-2xl
                   bg-accent py-4 text-[16.5px] font-bold text-surface shadow-pop
                   transition-all duration-200 active:scale-[0.98]"
        style={{ animationDelay: "160ms" }}
      >
        <LogIn size={19} strokeWidth={2.4} />
        Entrar com Google
      </button>

      {error && (
        <p className="rise mt-4 text-[13px] text-accent-ink" style={{ animationDelay: "0ms" }}>
          {error}
        </p>
      )}
    </div>
  );
}

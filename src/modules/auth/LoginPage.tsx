import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      if (error) setErrorMsg(error);
    } else {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMsg(error);
      } else {
        setInfoMsg('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
      }
    }

    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-sindicat-bg text-sindicat-ink flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-sindicat-surface p-6 sm:p-8 shadow-sm border border-sindicat-primary-light">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sindicat-primary text-white font-bold text-lg">
            SC
          </div>
          <h1 className="text-2xl font-bold text-sindicat-primary">SindiCat</h1>
          <p className="mt-1 text-sm text-sindicat-ink/70">
            {mode === 'login'
              ? 'Acceso privado de administración'
              : 'Recuperación de contraseña'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sindicat-ink mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="administradora@ejemplo.com"
              className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none focus:ring-2 focus:ring-sindicat-primary/20"
            />
          </div>

          {mode === 'login' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-sindicat-ink mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-sindicat-ink/20 bg-white px-3.5 py-2.5 text-sm focus:border-sindicat-primary focus:outline-none focus:ring-2 focus:ring-sindicat-primary/20"
              />
            </div>
          )}

          {errorMsg && (
            <div role="alert" className="rounded-xl bg-sindicat-danger/10 border border-sindicat-danger/30 px-3.5 py-2.5 text-sm text-sindicat-danger">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div role="status" className="rounded-xl bg-sindicat-primary-light border border-sindicat-primary/30 px-3.5 py-2.5 text-sm text-sindicat-primary">
              {infoMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-sindicat-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
          >
            {submitting
              ? 'Procesando...'
              : mode === 'login'
                ? 'Iniciar sesión'
                : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'reset' : 'login');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className="text-sm font-medium text-sindicat-primary hover:underline cursor-pointer"
          >
            {mode === 'login' ? '¿Olvidaste tu contraseña?' : 'Volver al inicio de sesión'}
          </button>
        </div>
      </section>
    </main>
  );
}
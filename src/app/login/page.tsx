"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { login, saveSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const session = await login(email.trim(), password);
    setIsLoading(false);

    if (!session) {
      setError(
        "No se pudo iniciar sesión. Revisa tus credenciales o que la API esté encendida."
      );
      return;
    }

    saveSession(session);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6">
      <section className="grid min-h-[620px] w-full max-w-6xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl shadow-slate-900/15 lg:grid-cols-[1.16fr_0.9fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-9 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
          <Image
            src="/login-car.webp"
            alt=""
            fill
            priority
            className="object-cover opacity-70"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/70 to-slate-950/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,_rgba(44,113,181,0.38),_transparent_30%),linear-gradient(90deg,_rgba(15,23,42,0.5),_transparent_55%)]" />

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#d9ecff] backdrop-blur">
                <Car size={26} />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">
                  Renta<span className="text-[#2c71b5]">mivar</span>
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.38em] text-slate-300">
                  Sistema interno
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-lg">
              <h1 className="text-4xl font-bold leading-tight tracking-tight">
                Gestiona tus rentas de forma{" "}
                <span className="text-[#2c71b5]">rápida</span> y segura.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
                Administra vehículos, clientes, contratos y mantenimientos desde
                un solo panel.
              </p>
            </div>
          </div>

          <div className="relative flex max-w-sm items-center gap-4 text-slate-200">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#2c71b5]/40 bg-[#2c71b5]/20 text-[#d9ecff]">
              <ShieldCheck size={22} />
            </div>
            <p className="text-sm leading-6">
              Seguridad, confianza y control en cada proceso.
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center bg-white px-6 py-8 sm:px-9">
          <div className="w-full max-w-[390px]">
            <div className="mb-7 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2c71b5] text-white shadow-xl shadow-[#2c71b5]/25">
                <Car size={36} />
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                Bienvenido de nuevo
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Accede al panel interno de administración.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
              <div className="flex h-14 items-center rounded-2xl border border-slate-300 bg-white px-4 transition focus-within:border-slate-950 focus-within:ring-4 focus-within:ring-slate-200">
                <Mail size={21} className="shrink-0 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Correo electrónico"
                  autoComplete="off"
                  className="h-full w-full border-0 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="flex h-14 items-center rounded-2xl border border-slate-300 bg-white px-4 transition focus-within:border-slate-950 focus-within:ring-4 focus-within:ring-slate-200">
                <Lock size={21} className="shrink-0 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Contraseña"
                  autoComplete="new-password"
                  className="h-full w-full border-0 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 text-sm">
                <label className="flex items-center gap-3 text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#2c71b5] accent-[#2c71b5]"
                  />
                  Recordarme
                </label>
                <span className="font-medium text-[#2c71b5]">
                  Acceso autorizado
                </span>
              </div>

              {error && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#2c71b5] px-4 text-sm font-bold text-white shadow-xl shadow-[#2c71b5]/25 transition hover:-translate-y-0.5 hover:bg-[#245d96] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-400 disabled:shadow-none"
              >
                <Lock size={20} />
                {isLoading ? "Validando..." : "Iniciar sesión"}
              </button>
            </form>

            <div className="mt-10 border-t border-slate-200 pt-6">
              <p className="flex items-center justify-center gap-3 text-sm text-slate-500">
                <ShieldCheck size={20} />
                Sistema interno de gestión de rentas
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

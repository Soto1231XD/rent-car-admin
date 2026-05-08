"use client";

import { useRouter } from "next/navigation";
import { Car, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Login simulado para prototipo
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 md:grid-cols-2">
        <div className="hidden bg-slate-900 p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100 ring-1 ring-white/10">
              <Car size={26} />
            </div>

            <h1 className="mt-8 text-3xl font-bold">
              Rentamivar Admin
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Plataforma administrativa para gestionar vehículos, clientes,
              rentas, calendario y documentos.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Acceso exclusivo para personal autorizado.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Iniciar sesión
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Ingresa tus credenciales para acceder al panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Correo electrónico
              </span>

              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-200">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@empresa.com"
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Contraseña
              </span>

              <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-200">
                <Lock size={18} className="text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <button
            type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:bg-slate-700"
            >
              Entrar al sistema
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Prototipo visual. La autenticación real se conectará con el backend.
          </p>
        </div>
      </section>
    </main>
  );
}

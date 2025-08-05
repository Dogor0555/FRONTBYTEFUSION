// src/app/dashboard/page.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WelcomeClient from "./welcome-client";
import { Suspense } from "react";
import { checkAuth } from "../../lib/auth";

export default async function Dashboard() {
  // Obtener las cookies del usuario (usando await)
  const cookieStore = await cookies(); // ¡Aquí está el cambio!
  const cookie = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  // Verificar la autenticación del lado del servidor
  const user = await checkAuth(cookie);

  // Si el usuario no está autenticado, redirigir al login
  if (!user) {
    redirect("/auth/login");
  }

  // Si el usuario está autenticado, renderizar el dashboard
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <WelcomeClient user={user} />
    </Suspense>
  );
}
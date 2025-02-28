import PersonaNatural from "./personaJuridica";
import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route"; // Ajusta esta ruta según donde tengas tus opciones de autenticación

export default async function PersonaNat() {
  // Verificar la sesión del lado del servidor
  const session = await getServerSession(authOptions);

  // Si no hay sesión, redirigir al login
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>}>
      <PersonaNatural />
    </Suspense>
  );
}
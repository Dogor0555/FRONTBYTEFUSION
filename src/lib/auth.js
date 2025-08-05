// src/lib/auth.js
export async function checkAuth(cookie) {
  try {
    const response = await fetch("http://localhost:3000/checkAuth", {
      method: "GET",
      headers: {
        Cookie: cookie || "", // Envía las cookies al backend
      },
      credentials: "include", // Incluye las cookies en la solicitud
    });

    if (!response.ok) {
      return false; // No está autenticado
    }

    const data = await response.json();
    return data.user; // Devuelve la información del usuario autenticado
  } catch (error) {
    console.error("Error al verificar la autenticación:", error);
    return false;
  }
}
// src/app/services/auth.js
export const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
       credentials: 'include', // Esto es crucial
      body: JSON.stringify({ correo: email, contrasena: password }),
    });
  
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }
  
    return response.json();
  };
  
  export const logout = async () => {
    const response = await fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include', // Incluir cookies en la solicitud
    });
  
    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }
  
    return response.json();
  };


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
  
      return true; // Está autenticado
    } catch (error) {
      console.error("Error al verificar la autenticación:", error);
      return false;
    }
  }

  
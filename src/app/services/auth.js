// src/app/services/auth.js
export const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ correo: email, contrasena: password }),
  });

  if (!response.ok) {
    throw new Error('Credenciales inválidas');
  }

  // Verificar token de Hacienda después del login exitoso
  const haciendaCheck = await fetch('http://localhost:3000/hacienda/token-check', {
    method: 'GET',
    credentials: 'include',
  });

  if (!haciendaCheck.ok) {
    throw new Error('Error al conectar con Hacienda');
  }

  return response.json();
};

export const logout = async () => {
  const response = await fetch('http://localhost:3000/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al cerrar sesión');
  }

  return response.json();
};

export const checkAuthStatus = async (cookie = '') => {
  try {
    // Verificar autenticación en nuestro sistema
    const authResponse = await fetch('http://localhost:3000/checkAuth', {
      method: 'GET',
      headers: {
        Cookie: cookie,
      },
      credentials: 'include',
    });

    if (!authResponse.ok) {
      return { isAuthenticated: false, hasHaciendaToken: false };
    }

    // Verificar estado del token de Hacienda
    const haciendaStatus = await fetch('http://localhost:3000/statusTokenhacienda', {
      method: 'GET',
      headers: {
        Cookie: cookie,
      },
      credentials: 'include',
    });

    const haciendaData = await haciendaStatus.json();
    
    return {
      isAuthenticated: true,
      hasHaciendaToken: haciendaStatus.ok && haciendaData.valid,
      haciendaStatus: haciendaData
    };
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    return { isAuthenticated: false, hasHaciendaToken: false };
  }
};
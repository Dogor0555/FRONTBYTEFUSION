//src/app/api/personasJuridicas/[id]/route.js


import { cookies } from 'next/headers';

// La URL base de tu API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Función auxiliar para realizar peticiones con el token
async function fetchWithAuth(url, options = {}) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    throw new Error('No token found');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `token=${token}`,
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

// GET - Obtener una persona jurídica por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const response = await fetchWithAuth(`${API_URL}/personasJuridicas/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching persona jurídica by ID:', error);
    return Response.json({ error: 'Error al obtener la empresa' }, { status: 500 });
  }
}

// PUT - Actualizar una persona jurídica
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const response = await fetchWithAuth(`${API_URL}/personasJuridicas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error updating persona jurídica:', error);
    return Response.json({ error: 'Error al actualizar la empresa' }, { status: 500 });
  }
}

// DELETE - Eliminar una persona jurídica
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const response = await fetchWithAuth(`${API_URL}/personasJuridicas/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error deleting persona jurídica:', error);
    return Response.json({ error: 'Error al eliminar la empresa' }, { status: 500 });
  }
}
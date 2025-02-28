//src/app/api/personasJuridicas/route.js
import { cookies } from 'next/headers';
import { getSession } from 'next-auth/react';


// La URL base de tu API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Función auxiliar para realizar peticiones con el token
async function fetchWithAuth(url, options = {}) {
    const session = await getServerSession(authOptions); // For server components
    
    if (!session || !session.accessToken) {
      throw new Error('No token found or session expired');
    }
  
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
      ...options.headers
    };
  
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  }

// GET - Obtener todas las personas jurídicas
export async function GET(request) {
  try {
    const response = await fetchWithAuth(`${API_URL}/personasJuridicas`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching personas jurídicas:', error);
    return Response.json({ error: 'Error al obtener las empresas' }, { status: 500 });
  }
}

// POST - Crear una nueva persona jurídica
export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetchWithAuth(`${API_URL}/personasJuridicas`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating persona jurídica:', error);
    return Response.json({ error: 'Error al crear la empresa' }, { status: 500 });
  }
}
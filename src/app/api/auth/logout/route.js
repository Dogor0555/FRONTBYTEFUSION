import { NextResponse } from "next/server";
import axios from "axios";

export async function POST() {
    try {
        // Asegúrate de que la URL sea correcta y que el endpoint exista
        await axios.post("http://localhost:3000/logout", {}, { withCredentials: true });
        
        // Configurar una cookie de limpieza en la respuesta
        const response = NextResponse.json({ mensaje: "Sesión cerrada correctamente" }, { status: 200 });
        
        // Opcional: limpiar las cookies de sesión directamente desde aquí
        response.cookies.delete("next-auth.session-token");
        response.cookies.delete("__Secure-next-auth.session-token");
        
        return response;
    } catch (error) {
        console.error("Error al cerrar sesión en el servidor:", error);
        return NextResponse.json({ 
            mensaje: "Error al cerrar sesión", 
            error: error.message 
        }, { status: 500 });
    }
}
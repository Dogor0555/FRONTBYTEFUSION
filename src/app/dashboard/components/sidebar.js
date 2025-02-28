"use client";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { FaHome, FaFileInvoiceDollar, FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaUserAlt, FaBuilding } from "react-icons/fa";
import logo from "../../../app/images/logo.jpg";
import axios from "axios";
import { useState } from "react";

export default function Sidebar() {
    // Siempre declara todos los hooks al principio, antes de cualquier lógica condicional
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isClientsOpen, setIsClientsOpen] = useState(false); // Estado para controlar la apertura del submenú Clientes

    
    const handleSignOut = async () => {
        if (isLoggingOut) return; // Prevenir múltiples clicks
        
        setIsLoggingOut(true);
        
        try {
            // Primero llama a tu endpoint de backend para limpiar la cookie
            await axios.post("/api/auth/logout", {}, {
                withCredentials: true // Importante para enviar/recibir cookies
            });
            
            // Luego cierra la sesión en NextAuth
            await signOut({ redirect: false });
            
            // Finalmente, redirige al usuario
            router.push("/auth/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            // Aún así intentamos cerrar la sesión en el cliente
            await signOut({ redirect: false });
            router.push("/auth/login");
        } finally {
            setIsLoggingOut(false);
        }
    };
    
    const menuItems = [
        { name: "Inicio", icon: <FaHome />, href: "#" },
        { name: "Facturas", icon: <FaFileInvoiceDollar />, href: "#" },
        { 
            name: "Clientes", 
            icon: <FaUsers />, 
            href: "#",
            subMenu: [
                { name: "Persona Natural", icon: <FaUserAlt />, href: "/dashboard/persona_natural" },
                { name: "Persona Jurídica", icon: <FaBuilding />, href: "/dashboard/persona_juridica" }
            ]
        },
        { name: "Reportes", icon: <FaChartBar />, href: "#" },
        { name: "Configuración", icon: <FaCog />, href: "#" },
    ];
    
    return (
        <aside className="bg-blue-900 h-full w-64">
            <div className="flex flex-col h-full">
                {/* Logo y Título */}
                <div className="flex items-center justify-center h-20 border-b border-blue-800">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image src={logo} alt="Byte Fusion Soluciones" fill className="object-cover" />
                    </div>
                    <span className="ml-3 text-white font-semibold text-lg">Facturador</span>
                </div>
                {/* Navegación */}
                <nav className="flex-1 py-4 px-2 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map(({ name, icon, href, subMenu }) => (
                            <li key={name}>
                                {subMenu ? (
                                    <div>
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-3 text-blue-100 rounded-md transition-all duration-200 hover:bg-blue-700 hover:text-white"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsClientsOpen(!isClientsOpen); // Cambiar el estado para abrir/cerrar el submenú
                                            }}
                                        >
                                            <span className="text-lg">{icon}</span>
                                            <span className="ml-3">{name}</span>
                                        </a>
                                        {isClientsOpen && ( // Mostrar el submenú solo si está abierto
                                            <ul className="pl-6 space-y-2">
                                                {subMenu.map(({ name, icon, href }) => (
                                                    <li key={name}>
                                                        <a
                                                            href={href}
                                                            className="flex items-center px-4 py-3 text-blue-100 rounded-md transition-all duration-200 hover:bg-blue-700 hover:text-white"
                                                        >
                                                            <span className="text-lg">{icon}</span>
                                                            <span className="ml-3">{name}</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <a
                                        href={href}
                                        className="flex items-center px-4 py-3 text-blue-100 rounded-md transition-all duration-200 hover:bg-blue-700 hover:text-white"
                                    >
                                        <span className="text-lg">{icon}</span>
                                        <span className="ml-3">{name}</span>
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
                {/* Logout */}
                <div className="p-4 border-t border-blue-800">
                    <button
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className="flex items-center w-full px-4 py-3 text-blue-100 rounded-md transition-all duration-200 hover:bg-blue-700 hover:text-white disabled:opacity-50"
                    >
                        <FaSignOutAlt className="text-lg" />
                        <span className="ml-3">{isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
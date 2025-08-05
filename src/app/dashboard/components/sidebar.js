"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaHome, FaFileInvoiceDollar, FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaUserAlt, FaBuilding, FaBoxOpen, FaFileContract, FaFileInvoice, FaFileAlt } from "react-icons/fa";
import logo from "../../../app/images/logoo.png";
import { logout } from "../../services/auth";
import { useState } from "react";

export default function Sidebar() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [openMenus, setOpenMenus] = useState({
        dtes: false, // Estado para el menú de DTES
        clients: false, // Estado para el menú de Clientes
    });

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const toggleMenu = (menu) => {
        setOpenMenus((prevState) => ({
            ...prevState,
            [menu]: !prevState[menu], // Alternar el estado del menú seleccionado
        }));
    };

    const menuItems = [
        { name: "Inicio", icon: <FaHome />, href: "#" },
        { 
            name: "DTES", 
            icon: <FaFileInvoiceDollar />, 
            href: "#",
            subMenu: [
                { name: "DTE Factura", icon: <FaFileInvoice />, href: "/dashboard/dte_factura" },
                { name: "DTE Credito", icon: <FaFileContract />, href: "/dashboard/dte_credito" }
            ],
            menuKey: "dtes" // Clave única para el menú de DTES
        },
        { name: "Facturas", icon: <FaFileAlt />, href: "/dashboard/facturas" },
        { name: "Creditos", icon: <FaFileAlt />, href: "/dashboard/creditos" },
        { 
            name: "Clientes", 
            icon: <FaUsers />, 
            href: "#",
            subMenu: [
                { name: "Persona Natural", icon: <FaUserAlt />, href: "/dashboard/persona_natural" },
                { name: "Persona Jurídica", icon: <FaBuilding />, href: "/dashboard/persona_juridica" }
            ],
            menuKey: "clients" // Clave única para el menú de Clientes
        },
        { name: "Productos", icon: <FaBoxOpen />, href: "/dashboard/productos" },
        { name: "Reportes", icon: <FaChartBar />, href: "#" },
        { name: "Configuración", icon: <FaCog />, href: "#" },
    ];

    return (
    <aside className="bg-blue-900 h-full w-64">
            <div className="flex flex-col h-full">
                {/* Logo y Título */}
                <div className="bg-blue-800 flex items-center justify-center h-20 border-b border-blue-700">
                    <div className="bg-white relative h-14 w-14 rounded-full overflow-hidden shadow-md">
                        <Image src={logo} alt="Byte Fusion Soluciones" fill className="object-cover" />
                    </div>
                    <div className="ml-3">
                        <span className="text-blue-50 font-semibold text-lg">Facturador</span>
                    </div>
                </div>
                {/* Navegación */}
                <nav className="flex-1 py-4 px-2 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map(({ name, icon, href, subMenu, menuKey }) => (
                            <li key={name}>
                                {subMenu ? (
                                    <div>
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-3 text-blue-100 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-600/60 hover:to-cyan-600/60 hover:text-white hover:shadow-md hover:shadow-blue-500/20 hover:backdrop-blur-sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleMenu(menuKey); // Alternar el estado del menú correspondiente
                                            }}
                                        >
                                            <span className="text-lg">{icon}</span>
                                            <span className="ml-3">{name}</span>
                                        </a>
                                        {openMenus[menuKey] && ( // Mostrar submenú si el menú está abierto
                                            <ul className="pl-6 space-y-2">
                                                {subMenu.map(({ name, icon, href }) => (
                                                    <li key={name}>
                                                        <a
                                                            href={href}
                                                            className="flex items-center px-4 py-3 text-blue-100 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-600/60 hover:to-cyan-600/60 hover:text-white hover:shadow-md hover:shadow-blue-500/20 hover:backdrop-blur-sm"
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
                                        className="flex items-center px-4 py-3 text-blue-100 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-600/60 hover:to-cyan-600/60 hover:text-white hover:shadow-md hover:shadow-blue-500/20 hover:backdrop-blur-sm"
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
                <div className="bg-blue-800 p-4 border-t border-blue-700">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center justify-center w-full px-4 py-3 text-blue-200 border border-blue-600 rounded-md transition-all duration-200 hover:bg-blue-700 hover:text-white hover:border-blue-500 disabled:opacity-50"
                    >
                        <FaSignOutAlt className="text-base" />
                        <span className="ml-3">{isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
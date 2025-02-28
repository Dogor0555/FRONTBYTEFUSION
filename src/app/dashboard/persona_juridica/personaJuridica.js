"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaBars, FaTimes, FaEdit, FaTrash, FaUserPlus, FaUser, FaSave, FaTimes as FaClose } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PersonaJuridica() {
    // Core hooks
    const router = useRouter();
    const { data: session, status } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userName, setUserName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    
    // Client management state
    const [searchTerm, setSearchTerm] = useState("");
    const [clientFound, setClientFound] = useState(false);
    const [clientData, setClientData] = useState(null);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);
    // Confirmation modal states
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        nombre: "",
        nit: "",
        nrc: "",
        giro: "",
        correo: "",
        telefono: "",
        direccion: ""
    });
    
    // Empresas data from API
    const [empresas, setEmpresas] = useState([]);

    // Authentication redirect
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);
    
    // Update username from session
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            setUserName(session.user.name || "");
        }
    }, [session, status]);

    // Fetch empresas from API
    useEffect(() => {
        const fetchEmpresas = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/../../api/personasJuridicas');
                if (!response.ok) {
                    throw new Error('Error al obtener empresas');
                }
                const data = await response.json();
                setEmpresas(Array.isArray(data) ? data : []);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching empresas:", error);
                setEmpresas([]);
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchEmpresas();
        }
    }, [status]);

    // Handle responsive layout
    useEffect(() => {
        const checkMobile = () => {
            const mobileBreakpoint = 768;
            const isMobileView = window.innerWidth < mobileBreakpoint;
            setIsMobile(isMobileView);
            setSidebarOpen(!isMobileView);
        };

        // Initial check
        checkMobile();
        
        // Add resize listener
        window.addEventListener("resize", checkMobile);
        
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    // Toggle sidebar
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Handle search
    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setClientFound(false);
            setClientData(null);
            return;
        }

        const foundEmpresa = empresas.find(empresa => 
            empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            empresa.nit.includes(searchTerm) ||
            empresa.nrc.includes(searchTerm) ||
            (empresa.correo && empresa.correo.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (foundEmpresa) {
            setClientFound(true);
            setClientData(foundEmpresa);
        } else {
            setClientFound(false);
            setClientData(null);
        }
    };

    // Handle add client
    const handleAddClient = () => {
        setFormData({
            nombre: "",
            nit: "",
            nrc: "",
            giro: "",
            correo: "",
            telefono: "",
            direccion: ""
        });
        setShowAddModal(true);
    };

    // Handle edit client
    const handleEditClient = (empresaId) => {
        const empresa = empresas.find(emp => emp.id === empresaId);
        if (empresa) {
            setCurrentClient(empresa);
            setFormData({
                nombre: empresa.nombre || "",
                nit: empresa.nit || "",
                nrc: empresa.nrc || "",
                giro: empresa.giro || "",
                correo: empresa.correo || "",
                telefono: empresa.telefono || "",
                direccion: empresa.direccion || ""
            });
            setShowEditModal(true);
        }
    };

    // Handle save new client
    const handleSaveNewClient = async () => {
        try {
            const response = await fetch('/api/personasJuridicas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Error al crear la empresa');
                return;
            }

            // Actualizar lista de empresas
            const updatedResponse = await fetch('/api/personasJuridicas');
            const updatedData = await updatedResponse.json();
            setEmpresas(Array.isArray(updatedData) ? updatedData : []);

            setShowAddModal(false);
            alert('Empresa creada con éxito');
        } catch (error) {
            console.error("Error al crear empresa:", error);
            alert('Error al crear la empresa');
        }
    };

    // Handle update client
    const handleUpdateClient = async () => {
        if (!currentClient?.id) return;

        try {
            const response = await fetch(`/api/personasJuridicas/${currentClient.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Error al actualizar la empresa');
                return;
            }

            // Actualizar lista de empresas
            const updatedResponse = await fetch('/api/personasJuridicas');
            const updatedData = await updatedResponse.json();
            setEmpresas(Array.isArray(updatedData) ? updatedData : []);

            // Actualizar clientData si es la empresa que se está mostrando
            if (clientData?.id === currentClient.id) {
                setClientData({...currentClient, ...formData});
            }

            setShowEditModal(false);
            alert('Empresa actualizada con éxito');
        } catch (error) {
            console.error("Error al actualizar empresa:", error);
            alert('Error al actualizar la empresa');
        }
    };

    // Handle delete client
    const handleDeleteClient = async (empresaId) => {
        try {
            const response = await fetch(`/api/personasJuridicas/${empresaId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Error al eliminar la empresa');
                return;
            }

            // Actualizar lista de empresas
            const updatedEmpresas = empresas.filter(emp => emp.id !== empresaId);
            setEmpresas(updatedEmpresas);

            // Si es la empresa que se está mostrando, limpiar
            if (clientData?.id === empresaId) {
                setClientFound(false);
                setClientData(null);
            }

            alert('Empresa eliminada con éxito');
        } catch (error) {
            console.error("Error al eliminar empresa:", error);
            alert('Error al eliminar la empresa');
        }
    };

    // Form change handler
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Don't render until authentication check completes
    if (status === "loading" || status === "unauthenticated") {
        return null;
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
            {/* Mobile sidebar overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            
            {/* Main layout */}
            <div className="flex flex-1 h-full">
                {/* Sidebar with responsive behavior */}
                <div 
                    className={`
                        md:static fixed z-40 h-full transition-all duration-300
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                        ${!isMobile ? 'md:translate-x-0 md:w-64' : ''}
                    `}
                >
                    <Sidebar />
                </div>
    
                {/* Main content area */}
                <div className="flex-1 flex flex-col">
                    {/* Top navbar */}
                    <header className="sticky top-0 bg-white backdrop-blur-md bg-opacity-90 shadow-sm z-20">
                        <div className="flex items-center justify-between h-16 px-4 md:px-6">
                            <div className="flex items-center">
                                {/* Mobile menu button */}
                                <button 
                                    className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                                    onClick={toggleSidebar}
                                    aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
                                >
                                    {sidebarOpen ? (
                                        <FaTimes className="h-6 w-6" />
                                    ) : (
                                        <FaBars className="h-6 w-6" />
                                    )}
                                </button>
                            </div>
                            
                            {/* User profile section */}
                            <div className="flex items-center">
                                {userName && (
                                    <span className="mr-2 text-xs md:text-sm text-black font-medium truncate max-w-24 md:max-w-none">
                                        {userName}
                                    </span>
                                )}
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white font-medium">
                                    {userName ? userName.charAt(0) : "U"}
                                </div>
                            </div>
                        </div>
                    </header>
    
                    {/* Main content with scrolling */}
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : (
                            <div className="min-h-[calc(100vh-16rem)]">
                                <div className="max-w-6xl mx-auto w-full relative">
                                    {/* Client Management Section */}
                                    <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
                                        <div className="p-4 md:p-6 lg:p-8">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                                                    Gestión de Personas Jurídicas
                                                </h2>
                                                
                                                <button 
                                                    onClick={handleAddClient}
                                                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                                >
                                                    <FaUserPlus className="mr-2" />
                                                    <span className="whitespace-nowrap">Agregar Empresa</span>
                                                </button>
                                            </div>
                                            
                                            {/* Client search */}
                                            <div className="mb-6">
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <div className="relative flex-1">
                                                        <input 
                                                            type="text"
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                            placeholder="Buscar empresa por nombre, NIT, NRC o correo..."
                                                            className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={handleSearch}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
                                                    >
                                                        <FaSearch className="mr-2" />
                                                        Buscar
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Client details card */}
                                            {clientFound && clientData && (
                                                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        Información de la Empresa
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Nombre:</p>
                                                            <p className="text-black font-medium">{clientData.nombre}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">NIT:</p>
                                                            <p className="text-black font-medium">{clientData.nit}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">NRC:</p>
                                                            <p className="text-black font-medium">{clientData.nrc}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Giro:</p>
                                                            <p className="text-black font-medium">{clientData.giro}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Email:</p>
                                                            <p className="text-black font-medium">{clientData.correo}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Teléfono:</p>
                                                            <p className="text-black font-medium">{clientData.telefono}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Dirección:</p>
                                                            <p className="text-black font-medium">{clientData.direccion}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <button 
                                                            onClick={() => handleEditClient(clientData.id)}
                                                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm transition-colors flex items-center"
                                                        >
                                                            <FaEdit className="mr-1" />
                                                            Editar
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setClientToDelete(clientData.id);
                                                                setShowDeleteConfirmModal(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors flex items-center"
                                                        >
                                                            <FaTrash className="mr-1" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Empresas table with responsive adjustments */}
                                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                                <div className="inline-block min-w-full align-middle">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead>
                                                            <tr className="bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium">
                                                                <th scope="col" className="py-3 px-3 sm:px-4 text-left">Nombre</th>
                                                                <th scope="col" className="py-3 px-3 sm:px-4 text-left">NIT</th>
                                                                <th scope="col" className="py-3 px-3 sm:px-4 text-left">NRC</th>
                                                                <th scope="col" className="py-3 px-3 sm:px-4 text-left hidden md:table-cell">Giro</th>
                                                                <th scope="col" className="py-3 px-3 sm:px-4 text-left hidden md:table-cell">Email</th>
                                                                <th scope="col" className="py-3 px-3 sm:px-4 text-center">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200 text-gray-600 text-xs sm:text-sm">
                                                            {empresas.length > 0 ? (
                                                                empresas.map((empresa) => (
                                                                    <tr key={empresa.id} className="hover:bg-gray-50">
                                                                        <td className="py-2 sm:py-3 px-3 sm:px-4 whitespace-nowrap">
                                                                            <div className="flex items-center">
                                                                                <div className="hidden sm:block mr-2">
                                                                                    <FaUser className="text-gray-400" />
                                                                                </div>
                                                                                <span className="truncate max-w-32 sm:max-w-none">{empresa.nombre}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-2 sm:py-3 px-3 sm:px-4 whitespace-nowrap">{empresa.nit}</td>
                                                                        <td className="py-2 sm:py-3 px-3 sm:px-4 whitespace-nowrap">{empresa.nrc}</td>
                                                                        <td className="py-2 sm:py-3 px-3 sm:px-4 whitespace-nowrap hidden md:table-cell">
                                                                            <span className="truncate block max-w-32 lg:max-w-none">{empresa.giro}</span>
                                                                        </td>
                                                                        <td className="py-2 sm:py-3 px-3 sm:px-4 whitespace-nowrap hidden md:table-cell">
                                                                            <span className="truncate block max-w-32 lg:max-w-none">{empresa.correo}</span>
                                                                        </td>
                                                                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                                                                            <div className="flex items-center justify-center gap-3">
                                                                                <button 
                                                                                    onClick={() => handleEditClient(empresa.id)}
                                                                                    className="transform hover:scale-110 transition-transform text-blue-600"
                                                                                    title="Editar empresa"
                                                                                    aria-label="Editar empresa"
                                                                                >
                                                                                    <FaEdit />
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        setClientToDelete(empresa.id);
                                                                                        setShowDeleteConfirmModal(true);
                                                                                    }}
                                                                                    className="transform hover:scale-110 transition-transform text-red-600"
                                                                                    title="Eliminar empresa"
                                                                                    aria-label="Eliminar empresa"
                                                                                >
                                                                                    <FaTrash />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="6" className="text-center py-4">
                                                                        No hay empresas registradas
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
    
                    {/* Footer Component */}
                    <Footer />
                </div>
            </div>
    
            {/* Add Empresa Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-medium text-gray-900">Agregar Empresa</h3>
                            <button 
                                onClick={() => {
                                    if (Object.values(formData).some(val => val.trim() !== '')) {
                                        setShowCancelConfirmModal(true);
                                    } else {
                                        setShowAddModal(false);
                                    }
                                }}
                                className="text-gray-400 hover:text-gray-500"
                                aria-label="Cerrar"
                            >
                                <FaClose className="h-5 w-5" />
                            </button>
                        </div>
    
                        <div className="px-6 py-4">
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveNewClient(); }}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre">
                                        Nombre de la Empresa
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"                                        value={formData.nombre}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nit">
                                        NIT
                                    </label>
                                    <input
                                        type="text"
                                        id="nit"
                                        name="nit"
                                        value={formData.nit}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nrc">
                                        NRC
                                    </label>
                                    <input
                                        type="text"
                                        id="nrc"
                                        name="nrc"
                                        value={formData.nrc}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="giro">
                                        Giro
                                    </label>
                                    <input
                                        type="text"
                                        id="giro"
                                        name="giro"
                                        value={formData.giro}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="correo">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        id="correo"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="telefono">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="direccion">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (Object.values(formData).some(val => val.trim() !== '')) {
                                                setShowCancelConfirmModal(true);
                                            } else {
                                                setShowAddModal(false);
                                            }
                                        }}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Empresa Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-medium text-gray-900">Editar Empresa</h3>
                            <button 
                                onClick={() => {
                                    if (Object.values(formData).some(val => val.trim() !== '')) {
                                        setShowCancelConfirmModal(true);
                                    } else {
                                        setShowEditModal(false);
                                    }
                                }}
                                className="text-gray-400 hover:text-gray-500"
                                aria-label="Cerrar"
                            >
                                <FaClose className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 py-4">
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdateClient(); }}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre">
                                        Nombre de la Empresa
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nit">
                                        NIT
                                    </label>
                                    <input
                                        type="text"
                                        id="nit"
                                        name="nit"
                                        value={formData.nit}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nrc">
                                        NRC
                                    </label>
                                    <input
                                        type="text"
                                        id="nrc"
                                        name="nrc"
                                        value={formData.nrc}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="giro">
                                        Giro
                                    </label>
                                    <input
                                        type="text"
                                        id="giro"
                                        name="giro"
                                        value={formData.giro}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="correo">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        id="correo"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="telefono">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="direccion">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (Object.values(formData).some(val => val.trim() !== '')) {
                                                setShowCancelConfirmModal(true);
                                            } else {
                                                setShowEditModal(false);
                                            }
                                        }}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-medium text-gray-900">Confirmar Eliminación</h3>
                            <button 
                                onClick={() => setShowDeleteConfirmModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                                aria-label="Cerrar"
                            >
                                <FaClose className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-gray-700 mb-4">
                                ¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirmModal(false)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteClient(clientToDelete);
                                        setShowDeleteConfirmModal(false);
                                    }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-medium text-gray-900">Confirmar Cancelación</h3>
                            <button 
                                onClick={() => setShowCancelConfirmModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                                aria-label="Cerrar"
                            >
                                <FaClose className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-gray-700 mb-4">
                                Tienes cambios sin guardar. ¿Estás seguro de que deseas cancelar?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCancelConfirmModal(false)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                                >
                                    Continuar Editando
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCancelConfirmModal(false);
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                        setFormData({
                                            nombre: "",
                                            nit: "",
                                            nrc: "",
                                            giro: "",
                                            correo: "",
                                            telefono: "",
                                            direccion: ""
                                        });
                                    }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                >
                                    Confirmar Cancelación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
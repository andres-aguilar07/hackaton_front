"use client";
import React, { useState, useEffect } from "react";
import {
  Package,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  Plus,
  Minus,
  Search,
  Filter,
  Bell,
  Calendar,
  User,
  MapPin,
  Activity,
  Thermometer,
  Timer,
  FileText,
  Download,
  Handshake,
  CheckSquare,
  X,
  Save,
  Edit,
  Trash2,
  RefreshCw,
  Zap,
  Shield,
  Package2,
} from "lucide-react";

import { supabase } from "../utils/supabase/client";
const Central = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [notifications, setNotifications] = useState([]);

//data de stock
  const [stock, setStock] = useState([
    {
      id: 1,
      item: {
        id: 1,
        nombre: "Pinzas Kelly",
        categoria: "Instrumental Quirúrgico"
      },
      cantidad_disponible: 15,
      cantidad_en_uso: 5,
      cantidad_minima: 10,
      ubicacion_almacen: "Estante A-1"
    },
    {
      id: 2,
      item: {
        id: 2,
        nombre: "Tijeras Mayo",
        categoria: "Instrumental Quirúrgico"
      },
      cantidad_disponible: 8,
      cantidad_en_uso: 3,
      cantidad_minima: 12,
      ubicacion_almacen: "Estante A-2"
    },
    {
      id: 3,
      item: {
        id: 3,
        nombre: "Bisturí #11",
        categoria: "Instrumental Quirúrgico"
      },
      cantidad_disponible: 25,
      cantidad_en_uso: 0,
      cantidad_minima: 15,
      ubicacion_almacen: "Estante B-1"
    }
  ]);

 
  const [activeSurgeries] = useState([
    {
      id: 1,
      procedimiento: "Apendicectomía",
      quirofano: "Q-01",
      cirujano: "Dr. García",
      horaInicio: "09:00",
      estado: "en_curso",
      instrumentos: [
        {
          nombre: "Pinzas Kelly",
          cantidad: 2,
          asignado: true
        },
        {
          nombre: "Tijeras Mayo",
          cantidad: 1,
          asignado: false
        }
      ]
    },
    {
      id: 2,
      procedimiento: "Colecistectomía",
      quirofano: "Q-02",
      cirujano: "Dr. Martínez",
      horaInicio: "10:30",
      estado: "preparacion",
      instrumentos: [
        {
          nombre: "Pinzas Kelly",
          cantidad: 3,
          asignado: false
        },
        {
          nombre: "Bisturí #11",
          cantidad: 2,
          asignado: false
        }
      ]
    }
  ]);
  const updateStock = (itemId, cantidad) => {
    setStock(prevStock => 
      prevStock.map(item => 
        item.id === itemId 
          ? { ...item, cantidad_disponible: cantidad }
          : item
      )
    );
  };


  const handleDelivery = () => {

    deliveryData.items.forEach(item => {
      updateStock(item.id, item.cantidad);
    });
    closeModal();
  };

  const handleSterilization = () => {
    setSterilizationLog(prev => [
      ...prev,
      {
        id: prev.length + 1,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        instrumentos: newSterilization.instrumentos,
        cirugia: newSterilization.cirugia,
        operador: newSterilization.operador,
        ciclo: newSterilization.ciclo,
        estado: "en_proceso"
      }
    ]);
    closeModal();
  };

  // Notificaciones
  const [notificationsList, setNotificationsList] = useState([  ]);

useEffect(() => {
  const fetchnotificaciones = async () => {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
    console.log(data);
    setNotificationsList(data);
  };
  fetchnotificaciones();
}, []);

  // Registro de esterilización
  const [sterilizationLog, setSterilizationLog] = useState([
    {
      id: 1,
      fecha: "2024-05-26",
      hora: "07:30",
      instrumentos: "Pinzas Kelly (x12)",
      cirugia: "Bypass Coronario",
      operador: "María González",
      ciclo: "Autoclave - 134°C - 15min",
      estado: "completado",
    },
    {
      id: 2,
      fecha: "2024-05-26",
      hora: "09:15",
      instrumentos: "Tijeras Mayo (x4)",
      cirugia: "Apendicectomía",
      operador: "Carlos Ruíz",
      ciclo: "Autoclave - 134°C - 15min",
      estado: "en_proceso",
    },
  ]);

  // Estado para entregas
  const [deliveryData, setDeliveryData] = useState({
    receptor: "",
    cirugia: "",
    quirofano: "",
    items: [],
  });

  const [newSterilization, setNewSterilization] = useState({
    instrumentos: "",
    cirugia: "",
    operador: "",
    ciclo: "Autoclave - 134°C - 15min",
  });

  // Nuevo estado para el modal de edición/agregar stock
  const [stockModal, setStockModal] = useState({
    show: false,
    type: '', // 'edit' o 'add'
    item: null
  });

  // Nuevo estado para los datos temporales del modal
  const [tempStockData, setTempStockData] = useState({
    cantidad_minima: 0,
    ubicacion_almacen: '',
    cantidad_agregar: 0
  });

  // Nuevo estado para el modal de detalles
  const [detailsModal, setDetailsModal] = useState({
    show: false,
    surgery: null
  });

  const getStockStatus = (item) => {
    if (item.cantidad_disponible <= item.cantidad_minima) return "critico";
    if (item.cantidad_disponible <= item.cantidad_minima * 2) return "bajo";
    return "normal";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "critico":
        return "bg-red-100 text-red-800 border-red-200";
      case "bajo":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSurgeryStatusColor = (status) => {
    switch (status) {
      case "en_curso":
        return "bg-green-100 text-green-800";
      case "preparacion":
        return "bg-yellow-100 text-yellow-800";
      case "programada":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNotificationColor = (tipo) => {
    switch (tipo) {
      case "URGENTE":
        return "border-l-red-500 bg-red-50";
      case "PROGRAMADA":
        return "border-l-yellow-500 bg-yellow-50";
      case "STOCK":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setDeliveryData({ receptor: "", cirugia: "", quirofano: "", items: [] });
    setNewSterilization({
      instrumentos: "",
      cirugia: "",
      operador: "",
      ciclo: "Autoclave - 134°C - 15min",
    });
  };

  // Función para abrir el modal de edición/agregar stock
  const openStockModal = (type, item) => {
    setStockModal({
      show: true,
      type,
      item
    });
    setTempStockData({
      cantidad_minima: item.cantidad_minima,
      ubicacion_almacen: item.ubicacion_almacen,
      cantidad_agregar: 0
    });
  };

  // Función para cerrar el modal de stock
  const closeStockModal = () => {
    setStockModal({
      show: false,
      type: '',
      item: null
    });
  };

  // Función para actualizar el stock
  const handleStockUpdate = (itemId, newData) => {
    setStock(prevStock => 
      prevStock.map(item => 
        item.id === itemId 
          ? { ...item, ...newData }
          : item
      )
    );
    closeStockModal();
  };

  // Función para agregar nuevo stock
  const handleAddStock = (itemId, cantidad) => {
    setStock(prevStock => 
      prevStock.map(item => 
        item.id === itemId 
          ? { ...item, cantidad_disponible: item.cantidad_disponible + cantidad }
          : item
      )
    );
    closeStockModal();
  };

  // Función para abrir el modal de detalles
  const openDetailsModal = (surgery) => {
    setDetailsModal({
      show: true,
      surgery
    });
  };

  // Función para cerrar el modal de detalles
  const closeDetailsModal = () => {
    setDetailsModal({
      show: false,
      surgery: null
    });
  };
  // Función para manejar la entrega de todos los instrumentos
  const handleDeliverAll = (surgeryId) => {
    console.log(surgeryId);
  };

  const TabButton = ({ id, icon: Icon, label, active, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  const renderModal = () => {
    switch (modalType) {
      case "delivery":
        return (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Registro de Entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receptor
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={deliveryData.receptor}
                    onChange={(e) =>
                      setDeliveryData((prev) => ({
                        ...prev,
                        receptor: e.target.value,
                      }))
                    }
                  >
                    <option value="">Seleccionar receptor...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cirugía
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={deliveryData.cirugia}
                    onChange={(e) =>
                      setDeliveryData((prev) => ({
                        ...prev,
                        cirugia: e.target.value,
                      }))
                    }
                  >
                    <option value="">Seleccionar cirugía...</option>
                    {activeSurgeries.map((surgery) => (
                      <option key={surgery.id} value={surgery.id}>
                        {surgery.procedimiento} - {surgery.quirofano}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrumentos
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {stock.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <span className="font-medium">
                            {item.item.nombre}
                          </span>
                          <p className="text-sm text-gray-500">
                            Disponibles: {item.cantidad_disponible}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const currentItems = deliveryData.items || [];
                              const existingItem = currentItems.find(
                                (i) => i.id === item.id
                              );
                              if (existingItem) {
                                setDeliveryData((prev) => ({
                                  ...prev,
                                  items: prev.items.map((i) =>
                                    i.id === item.id
                                      ? {
                                          ...i,
                                          cantidad: Math.min(
                                            i.cantidad + 1,
                                            item.cantidad_disponible
                                          ),
                                        }
                                      : i
                                  ),
                                }));
                              } else {
                                setDeliveryData((prev) => ({
                                  ...prev,
                                  items: [
                                    ...(prev.items || []),
                                    {
                                      id: item.id,
                                      cantidad: 1,
                                      nombre: item.item.nombre,
                                    },
                                  ],
                                }));
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                    value={deliveryData.observaciones || ""}
                    onChange={(e) =>
                      setDeliveryData((prev) => ({
                        ...prev,
                        observaciones: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelivery}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Registrar Entrega
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "sterilization":
        return (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Registro de Esterilización
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrumentos
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={newSterilization.instrumentos}
                    onChange={(e) =>
                      setNewSterilization((prev) => ({
                        ...prev,
                        instrumentos: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cirugía
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={newSterilization.cirugia}
                    onChange={(e) =>
                      setNewSterilization((prev) => ({
                        ...prev,
                        cirugia: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operador
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={newSterilization.operador}
                    onChange={(e) =>
                      setNewSterilization((prev) => ({
                        ...prev,
                        operador: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Esterilización
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={newSterilization.ciclo}
                    onChange={(e) =>
                      setNewSterilization((prev) => ({
                        ...prev,
                        ciclo: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSterilization}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Iniciar Esterilización
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Agregar el modal de stock antes del return final
  const renderStockModal = () => {
    if (!stockModal.show) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {stockModal.type === 'edit' ? 'Editar Stock' : 'Agregar Stock'}
          </h2>
          
          {stockModal.type === 'edit' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Mínima
                </label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={tempStockData.cantidad_minima}
                  onChange={(e) => {
                    setTempStockData(prev => ({
                      ...prev,
                      cantidad_minima: parseInt(e.target.value)
                    }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={tempStockData.ubicacion_almacen}
                  onChange={(e) => {
                    setTempStockData(prev => ({
                      ...prev,
                      ubicacion_almacen: e.target.value
                    }));
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad a Agregar
                </label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                  value={tempStockData.cantidad_agregar}
                  onChange={(e) => {
                    setTempStockData(prev => ({
                      ...prev,
                      cantidad_agregar: parseInt(e.target.value)
                    }));
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={closeStockModal}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (stockModal.type === 'edit') {
                  handleStockUpdate(stockModal.item.id, {
                    cantidad_minima: tempStockData.cantidad_minima,
                    ubicacion_almacen: tempStockData.ubicacion_almacen
                  });
                } else {
                  handleAddStock(stockModal.item.id, tempStockData.cantidad_agregar);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Agregar el modal de detalles antes del return final
  const renderDetailsModal = () => {
    if (!detailsModal.show || !detailsModal.surgery) return null;

    const surgery = detailsModal.surgery;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalles de la Cirugía
            </h2>
            <button
              onClick={closeDetailsModal}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Procedimiento</p>
                  <p className="font-medium">{surgery.procedimiento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quirófano</p>
                  <p className="font-medium">{surgery.quirofano}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cirujano</p>
                  <p className="font-medium">Dr. {surgery.cirujano}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hora de Inicio</p>
                  <p className="font-medium">{surgery.horaInicio}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Instrumental Asignado</h3>
              <div className="space-y-2">
                {surgery.instrumentos.map((instrumento, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{instrumento.nombre}</span>
                      <span className="text-sm text-gray-600">
                        Cantidad: {instrumento.cantidad}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {instrumento.asignado ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Asignado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600 text-sm">
                          <Clock className="w-4 h-4" />
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Central de Esterilización
              </h1>
              <p className="text-gray-600">Bienvenido, Juan Instrumentador</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Lunes, 26 de Mayo 2025
              </div>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                {notificationsList.filter((n) => n.leida === false).length >
                  0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationsList.filter((n) => n.leida === false).length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <TabButton
            id="stock"
            icon={Package}
            label="Gestión de Stock"
            active={activeTab === "stock"}
            onClick={setActiveTab}
          />
          <TabButton
            id="entregas"
            icon={Handshake}
            label="Entregas"
            active={activeTab === "entregas"}
            onClick={setActiveTab}
          />

          <TabButton
            id="notificaciones"
            icon={Bell}
            label="Notificaciones"
            active={activeTab === "notificaciones"}
            onClick={setActiveTab}
            badge={notificationsList.filter((n) => n.leida === false).length}
          />
          <TabButton
            id="esterilizacion"
            icon={Shield}
            label="Esterilización"
            active={activeTab === "esterilizacion"}
            onClick={setActiveTab}
          />
        </div>

        {/* Panel de Stock */}
        {activeTab === "stock" && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Inventario de Stock
                </h2>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar instrumentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Lista de stock */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Artículo
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Ubicación
                    </th>
                    <th className="text-center py-3 px-6 font-medium text-gray-900">
                      Total
                    </th>
                    <th className="text-center py-3 px-6 font-medium text-gray-900">
                      Disponible
                    </th>
                    <th className="text-center py-3 px-6 font-medium text-gray-900">
                      En Uso
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Estado
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {item.item.nombre}
                            </span>
                            <p className="text-sm text-gray-500 capitalize">
                              {item.item.categoria}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {item.ubicacion_almacen}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-medium">
                        {item.cantidad_disponible + item.cantidad_en_uso}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`font-medium ${
                            item.cantidad_disponible <= item.cantidad_minima
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.cantidad_disponible}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-medium text-blue-600">
                        {item.cantidad_en_uso}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            getStockStatus(item)
                          )}`}
                        >
                          {getStockStatus(item) === "critico"
                            ? "Stock Crítico"
                            : getStockStatus(item) === "bajo"
                            ? "Stock Bajo"
                            : "Normal"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openStockModal('edit', item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openStockModal('add', item)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Panel de Entregas */}
        {activeTab === "entregas" && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Registro de Entregas
                </h2>
                <button
                  onClick={() => openModal("delivery")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Entrega
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-6">
                {activeSurgeries.map((surgery) => (
                  <div key={surgery.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {surgery.procedimiento}
                        </h3>
                        <p className="text-gray-600">
                          Quirófano: {surgery.quirofano} | Dr.{" "}
                          {surgery.cirujano}
                        </p>
                        <p className="text-sm text-gray-500">
                          Inicio programado: {surgery.horaInicio}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getSurgeryStatusColor(
                          surgery.estado
                        )}`}
                      >
                        {surgery.estado === "en_curso"
                          ? "En Curso"
                          : surgery.estado === "preparacion"
                          ? "Preparación"
                          : "Programada"}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Instrumental Asignado
                      </h4>
                      <div className="space-y-2">
                        {surgery.instrumentos.map((instrumento, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium">
                                {instrumento.nombre}
                              </span>
                              <span className="text-sm text-gray-600">
                                Cantidad: {instrumento.cantidad}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {instrumento.asignado ? (
                                <span className="flex items-center gap-1 text-green-600 text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  Asignado
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    assignInstrument(surgery.id, index)
                                  }
                                  className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm"
                                >
                                  <CheckSquare className="w-4 h-4" />
                                  Asignar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleDeliverAll(surgery.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <Handshake className="w-4 h-4" />
                        Entregar Todo
                      </button>
                      <button 
                        onClick={() => openDetailsModal(surgery)}
                        className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Panel de Esterilización */}
        {activeTab === "esterilizacion" && (
          <div className="space-y-6">
            {/* Controles de esterilización */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Control de Esterilización
                  </h2>
                  <button
                    onClick={() => openModal("sterilization")}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Ciclo
                  </button>
                </div>
              </div>

              {/* Estadísticas de esterilización */}
              <div className="p-6 border-b">
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">15</p>
                    <p className="text-sm text-gray-600">
                      Ciclos Completados Hoy
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Timer className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-sm text-gray-600">En Proceso</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Thermometer className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">134°C</p>
                    <p className="text-sm text-gray-600">Temperatura Actual</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">98.5%</p>
                    <p className="text-sm text-gray-600">Tasa de Éxito</p>
                  </div>
                </div>
              </div>

              {/* Registro de esterilización */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Fecha/Hora
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Instrumentos
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Cirugía
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Operador
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Ciclo
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Estado
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sterilizationLog.map((log) => (
                      <tr key={log.id} className="border-t hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">
                              {log.fecha}
                            </p>
                            <p className="text-sm text-gray-500">{log.hora}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-gray-900">
                            {log.instrumentos}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {log.cirugia}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {log.operador}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">
                            {log.ciclo}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              log.estado === "completado"
                                ? "bg-green-100 text-green-800"
                                : log.estado === "en_proceso"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {log.estado === "completado"
                              ? "Completado"
                              : log.estado === "en_proceso"
                              ? "En Proceso"
                              : log.estado}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Equipos de esterilización */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Estado de Equipos
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Autoclave A1
                      </h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Activo
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temperatura:</span>
                        <span className="font-medium">134°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Presión:</span>
                        <span className="font-medium">2.1 bar</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiempo restante:</span>
                        <span className="font-medium text-blue-600">8 min</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Autoclave A2
                      </h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        Disponible
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Último ciclo:</span>
                        <span className="font-medium">09:30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mantenimiento:</span>
                        <span className="font-medium text-green-600">
                          Al día
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="font-medium">Listo para usar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel de Notificaciones */}
        {activeTab === "notificaciones" && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Centro de Notificaciones
              </h2>
              <p className="text-gray-600 mt-1">
                Alertas y solicitudes en tiempo real
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {notificationsList.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-4 rounded-lg ${getNotificationColor(
                      notification.tipo
                    )}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {notification.tipo === "URGENTE" && (
                            <Zap className="w-4 h-4 text-red-600" />
                          )}
                          {notification.tipo === "PROGRAMADA" && (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                          {notification.tipo === "STOCK" && (
                            <Package className="w-4 h-4 text-blue-600" />
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              notification.tipo === "URGENTE"
                                ? "bg-red-100 text-red-800"
                                : notification.tipo === "PROGRAMADA"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {notification.tipo}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {notification.titulo}
                        </h3>
                        <p className="text-gray-600">{notification.mensaje}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(
                            notification.fecha_creacion
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Renderizar el modal cuando showModal es true */}
      {showModal && renderModal()}
      
      {/* Agregar el modal de stock */}
      {renderStockModal()}
      
      {/* Agregar el modal de detalles */}
      {renderDetailsModal()}
    </div>
  );
};

export default Central;

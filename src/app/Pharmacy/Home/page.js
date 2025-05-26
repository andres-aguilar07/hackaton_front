"use client";
import { useState, useEffect } from "react";
import {
  Box, Package, Bell, Clock, AlertTriangle, CheckCircle, 
  Calendar, User, Search, Plus, FileText, Activity, X
} from "lucide-react";
import { 
  getMateriales,
  getNotificaciones,
  getCirugiasProgramadas,
  getSolicitudesMateriales,
  getCirugiasEnCurso,
  crearMaterial,
  asignarMaterialesACirugia
} from "../../../controllers/pharmacyController";

export default function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [scheduledSurgeries, setScheduledSurgeries] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [ongoingSurgeries, setOngoingSurgeries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal de nuevo material
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    nombre: '',
    stock: 0,
    minimo: 0
  });

  // Estados para el modal de asignar materiales
  const [showAssignMaterialModal, setShowAssignMaterialModal] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [materialsToAssign, setMaterialsToAssign] = useState([{
    materialId: '',
    cantidad: 1
  }]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          inventoryData,
          notificationsData,
          scheduledData,
          requestsData,
          ongoingData
        ] = await Promise.all([
          getMateriales(),
          getNotificaciones(),
          getCirugiasProgramadas(),
          getSolicitudesMateriales(),
          getCirugiasEnCurso()
        ]);

        setInventory(inventoryData);
        setNotifications(notificationsData);
        setScheduledSurgeries(scheduledData);
        setMaterialRequests(requestsData);
        setOngoingSurgeries(ongoingData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!newMaterial.nombre?.trim()) {
      alert("El nombre es requerido");
      return;
    }

    // Ensure numeric fields are numbers and non-negative
    const stock = parseInt(newMaterial.stock, 10);
    const minimo = parseInt(newMaterial.minimo, 10);

    if (isNaN(stock) || stock < 0) {
      alert("El stock debe ser un número positivo");
      return;
    }

    if (isNaN(minimo) || minimo < 0) {
      alert("El stock mínimo debe ser un número positivo");
      return;
    }

    // Prepare the data with proper types
    const materialData = {
      nombre: newMaterial.nombre.trim(),
      stock: stock,
      minimo: minimo
    };

    try {
      const result = await crearMaterial(materialData);
      
      if (result.error) {
        alert(typeof result.error === 'string' ? result.error : "Error al crear el material");
        return;
      }
      
      // Success - update inventory and reset form
      setInventory(prev => [...prev, result.data]);
      setShowNewMaterialModal(false);
      setNewMaterial({
        nombre: '',
        stock: 0,
        minimo: 0
      });
    } catch (error) {
      console.error("Error al crear material:", error);
      alert("Error inesperado al crear el material");
    }
  };

  const handleAssignMaterials = async (e) => {
    e.preventDefault();
    if (!selectedSurgery) return;

    try {
      const { error } = await asignarMaterialesACirugia(selectedSurgery.id, materialsToAssign);
      if (error) throw error;

      // Recargar los datos
      const [inventoryData, scheduledData] = await Promise.all([
        getMateriales(),
        getCirugiasProgramadas()
      ]);
      
      setInventory(inventoryData);
      setScheduledSurgeries(scheduledData);
      setShowAssignMaterialModal(false);
      setSelectedSurgery(null);
      setMaterialsToAssign([{ materialId: '', cantidad: 1 }]);
    } catch (error) {
      console.error("Error al asignar materiales:", error);
      alert("Error al asignar los materiales");
    }
  };

  const addMaterialField = () => {
    setMaterialsToAssign(prev => [...prev, { materialId: '', cantidad: 1 }]);
  };

  const removeMaterialField = (index) => {
    setMaterialsToAssign(prev => prev.filter((_, i) => i !== index));
  };

  const updateMaterialToAssign = (index, field, value) => {
    setMaterialsToAssign(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const renderTab = () => {
    switch(activeTab) {
      case 'inventory':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Inventario</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar material..."
                    className="pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <button 
                  onClick={() => setShowNewMaterialModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nuevo Material
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">En Uso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item, index) => (
                    <tr key={index}>
                     
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.en_uso}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.stock > item.minimo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.stock > item.minimo ? 'Disponible' : 'Stock Bajo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal para nuevo material */}
            {showNewMaterialModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Nuevo Material</h3>
                    <button onClick={() => setShowNewMaterialModal(false)}>
                      <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleCreateMaterial} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre</label>
                      <input
                        type="text"
                        value={newMaterial.nombre}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Stock Inicial</label>
                        <input
                          type="number"
                          value={newMaterial.stock}
                          onChange={(e) => setNewMaterial(prev => ({ 
                            ...prev, 
                            stock: e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                          }))}
                          className="w-full p-2 border rounded"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                        <input
                          type="number"
                          value={newMaterial.minimo}
                          onChange={(e) => setNewMaterial(prev => ({ 
                            ...prev, 
                            minimo: e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                          }))}
                          className="w-full p-2 border rounded"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowNewMaterialModal(false)}
                        className="px-4 py-2 border rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Crear Material
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Notificaciones</h2>
            <div className="grid gap-4">
              {notifications.map((notification, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  notification.urgencia === 'alta' ? 'border-red-200 bg-red-50' :
                  notification.urgencia === 'media' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {notification.urgencia === 'alta' ? (
                      <AlertTriangle className="text-red-500" size={24} />
                    ) : (
                      <Bell className="text-blue-500" size={24} />
                    )}
                    <div>
                      <h3 className="font-medium">{notification.titulo}</h3>
                      <p className="text-sm text-gray-600">{notification.mensaje}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        {notification.tiempo}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'scheduled':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cirugías Programadas</h2>
            {scheduledSurgeries.map((surgery, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{surgery.procedimiento}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {surgery.fecha} - {surgery.hora}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <User size={16} />
                        Dr. {surgery.cirujano}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSurgery(surgery);
                      setShowAssignMaterialModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Asignar Material
                  </button>
                </div>
              </div>
            ))}

            {/* Modal para asignar materiales */}
            {showAssignMaterialModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Asignar Materiales</h3>
                    <button onClick={() => setShowAssignMaterialModal(false)}>
                      <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleAssignMaterials} className="space-y-4">
                    {materialsToAssign.map((material, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Material</label>
                          <select
                            value={material.materialId}
                            onChange={(e) => updateMaterialToAssign(index, 'materialId', e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                          >
                            <option value="">Seleccionar material</option>
                            {inventory.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.nombre} (Stock: {item.stock - item.en_uso})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-sm font-medium mb-1">Cantidad</label>
                          <input
                            type="number"
                            value={material.cantidad}
                            onChange={(e) => updateMaterialToAssign(index, 'cantidad', parseInt(e.target.value))}
                            className="w-full p-2 border rounded"
                            min="1"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMaterialField(index)}
                          className="p-2 text-red-500"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMaterialField}
                      className="text-blue-600 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Agregar material
                    </button>
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAssignMaterialModal(false)}
                        className="px-4 py-2 border rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Asignar Materiales
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'ongoing':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cirugías en Curso</h2>
            {ongoingSurgeries.map((surgery, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Activity className="text-green-500" size={20} />
                      <h3 className="font-medium">{surgery.procedimiento}</h3>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} />
                        Paciente: {surgery.paciente}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} />
                        Cirujano: {surgery.cirujano}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {surgery.fecha} - {surgery.hora}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="text-sm text-gray-500">Material en uso:</div>
                      {surgery.materiales && surgery.materiales.length > 0 ? (
                        surgery.materiales.map((material, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Package size={16} />
                            {material.nombre} x {material.cantidad}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          No hay materiales asignados
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      En Progreso
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      surgery.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                      surgery.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      Prioridad: {surgery.prioridad}
                    </span>
                  </div>
                </div>
                {(surgery.observaciones || surgery.notas) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {surgery.observaciones && (
                      <div className="text-sm">
                        <span className="font-medium">Observaciones:</span> {surgery.observaciones}
                      </div>
                    )}
                    {surgery.notas && (
                      <div className="text-sm mt-1">
                        <span className="font-medium">Notas:</span> {surgery.notas}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Central de Farmacia</h1>
        <p className="text-gray-600">Gestión de inventario y suministros quirúrgicos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <Box className="text-blue-500" size={24} />
            <div>
              <div className="text-sm text-gray-600">Total Inventario</div>
              <div className="text-xl font-semibold">{inventory.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-3">
            <Bell className="text-yellow-500" size={24} />
            <div>
              <div className="text-sm text-gray-600">Notificaciones</div>
              <div className="text-xl font-semibold">{notifications.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-3">
            <Calendar className="text-purple-500" size={24} />
            <div>
              <div className="text-sm text-gray-600">Cirugías Programadas</div>
              <div className="text-xl font-semibold">{scheduledSurgeries.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <Activity className="text-green-500" size={24} />
            <div>
              <div className="text-sm text-gray-600">Cirugías en Curso</div>
              <div className="text-xl font-semibold">{ongoingSurgeries.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-4" aria-label="Tabs">
            {[
              { key: 'inventory', label: 'Inventario', icon: Box },
              { key: 'notifications', label: 'Notificaciones', icon: Bell },
              { key: 'scheduled', label: 'Cirugías Programadas', icon: Calendar },
              { key: 'ongoing', label: 'En Curso', icon: Activity }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 inline-flex items-center gap-2 border-b-2 text-sm font-medium ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}

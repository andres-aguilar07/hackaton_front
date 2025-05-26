"use client";
import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Play, Pause, CheckCircle, Clock, X,
  Calendar, Clock as TimeIcon, User, Scissors, Users, Zap, ClipboardList
} from "lucide-react";

const cirujanos = ["Dr. Rodríguez", "Dra. Martínez", "Dr. López", "Dra. Fernández"];
const auxiliares = ["Aux. Gómez", "Aux. Pérez", "Aux. Torres", "Aux. Ramírez"];
const soportes = ["Anest. Jiménez", "Anest. Ruiz", "Anest. Vargas"];
const instrumentadores = ["Instr. Díaz", "Instr. Suárez", "Instr. García", "Instr. Mendoza"];
const cirugias = ["Apendicectomía", "Colecistectomía", "Cesárea", "Herniorrafia", "Artroscopia", "Histerectomía"];
const quirofanos = ["Quirófano 1", "Quirófano 2", "Quirófano 3", "Quirófano 4"];

const statusOptions = {
  scheduled: { label: "Programada", color: "bg-purple-100 text-purple-800", icon: <Clock size={16} /> },
  in_progress: { label: "En Progreso", color: "bg-blue-100 text-blue-800", icon: <Play size={16} /> },
  paused: { label: "Pausada", color: "bg-yellow-100 text-yellow-800", icon: <Pause size={16} /> },
  completed: { label: "Completada", color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} /> },
  postponed: { label: "Pospuesta", color: "bg-gray-100 text-gray-800", icon: <Clock size={16} /> }
};

export default function SurgeryDashboard() {
  const [surgeries, setSurgeries] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [action, setAction] = useState({ type: "", index: null });
  const [formData, setFormData] = useState({
    room: "",
    procedure: "",
    surgeon: "",
    assistants: [],
    support: "",
    instrumenters: [],
    status: "scheduled",
    date: "",
    time: "",
    notes: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // Set default date to today and time to next full hour
  useEffect(() => {
    if (formOpen && !formData.date) {
      const today = new Date();
      const nextHour = new Date(today.setHours(today.getHours() + 1, 0, 0, 0));
      
      setFormData(prev => ({
        ...prev,
        date: today.toISOString().split('T')[0],
        time: `${nextHour.getHours().toString().padStart(2, '0')}:00`
      }));
    }
  }, [formOpen, formData.date]);

  const handleSubmit = () => {
    if (!formData.room || !formData.procedure || !formData.surgeon || !formData.date || !formData.time) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...surgeries];
      updated[editingIndex] = formData;
      setSurgeries(updated);
    } else {
      setSurgeries([...surgeries, formData]);
    }
    closeForm();
  };

  const handleStatusChange = (index, newStatus) => {
    const updated = [...surgeries];
    updated[index].status = newStatus;
    setSurgeries(updated);
    setConfirmOpen(false);
  };

  const confirmAction = (type, index) => {
    setAction({ type, index });
    setConfirmOpen(true);
  };

  const executeAction = () => {
    switch (action.type) {
      case "delete":
        handleDelete(action.index);
        break;
      case "start":
        handleStatusChange(action.index, "in_progress");
        break;
      case "pause":
        handleStatusChange(action.index, "paused");
        break;
      case "complete":
        handleStatusChange(action.index, "completed");
        break;
      case "postpone":
        handleStatusChange(action.index, "postponed");
        break;
      default:
        break;
    }
  };

  const handleDelete = (index) => {
    setSurgeries(surgeries.filter((_, i) => i !== index));
    setConfirmOpen(false);
  };

  const handleMultiSelect = (field, value, isChecked) => {
    setFormData(prev => {
      const currentValues = [...prev[field]];
      if (isChecked) {
        return {...prev, [field]: [...currentValues, value]};
      } else {
        return {...prev, [field]: currentValues.filter(item => item !== value)};
      }
    });
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormData({
      room: "",
      procedure: "",
      surgeon: "",
      assistants: [],
      support: "",
      instrumenters: [],
      status: "scheduled",
      date: "",
      time: "",
      notes: ""
    });
    setEditingIndex(null);
  };

  const renderSelect = (label, value, onChange, options, required = false, icon = null) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {icon && <span className="text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select 
        value={value} 
        onChange={onChange} 
        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        required={required}
      >
        <option value="">Seleccionar...</option>
        {options.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const renderMultiSelect = (label, selectedValues, options, fieldName, required = false, icon = null) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {icon && <span className="text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto">
        {options.map((option, idx) => (
          <div key={idx} className="flex items-center p-1 hover:bg-gray-50 rounded">
            <input
              type="checkbox"
              id={`${fieldName}-${idx}`}
              checked={selectedValues.includes(option)}
              onChange={(e) => handleMultiSelect(fieldName, option, e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor={`${fieldName}-${idx}`} className="text-sm text-gray-700">{option}</label>
          </div>
        ))}
      </div>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((value, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
              {value}
              <button 
                type="button"
                onClick={() => handleMultiSelect(fieldName, value, false)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderDateTime = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Calendar size={16} className="text-gray-500" />
          Fecha <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <TimeIcon size={16} className="text-gray-500" />
          Hora <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({...formData, time: e.target.value})}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />
      </div>
    </div>
  );

  const renderStatusBadge = (status) => {
    const statusInfo = statusOptions[status] || statusOptions.scheduled;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${statusInfo.color}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  const getAvailableActions = (status) => {
    switch (status) {
      case "scheduled":
        return [
          { label: "Iniciar", icon: <Play size={16} />, color: "text-blue-600", action: "start" },
          { label: "Posponer", icon: <Clock size={16} />, color: "text-gray-600", action: "postpone" }
        ];
      case "in_progress":
        return [
          { label: "Pausar", icon: <Pause size={16} />, color: "text-yellow-600", action: "pause" },
          { label: "Completar", icon: <CheckCircle size={16} />, color: "text-green-600", action: "complete" }
        ];
      case "paused":
        return [
          { label: "Reanudar", icon: <Play size={16} />, color: "text-blue-600", action: "start" },
          { label: "Completar", icon: <CheckCircle size={16} />, color: "text-green-600", action: "complete" }
        ];
      case "postponed":
        return [
          { label: "Reagendar", icon: <Calendar size={16} />, color: "text-purple-600", action: "reschedule" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Scissors size={24} className="text-blue-600" />
              Panel de Cirugías
            </h1>
            <p className="text-gray-600 mt-1">Gestión moderna de intervenciones quirúrgicas</p>
          </div>
          <button 
            onClick={() => {
              setFormOpen(true);
              setEditingIndex(null);
            }} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={18} /> Nueva Cirugía
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-700">Fecha/Hora</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Procedimiento</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Quirófano</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Cirujano</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Estado</th>
                <th className="p-3 text-sm font-semibold text-gray-700 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {surgeries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No hay cirugías programadas
                  </td>
                </tr>
              ) : (
                surgeries.map((surgery, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{surgery.date}</div>
                        <div className="text-gray-500">{surgery.time}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{surgery.procedure}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {surgery.instrumenters.length > 0 ? surgery.instrumenters.join(", ") : "Sin instrumentadores"}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-900">{surgery.room}</td>
                    <td className="p-3 text-sm text-gray-900">{surgery.surgeon}</td>
                    <td className="p-3">
                      {renderStatusBadge(surgery.status)}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => {
                            setFormData({...surgery});
                            setEditingIndex(index);
                            setFormOpen(true);
                          }} 
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        
                        {getAvailableActions(surgery.status).map((btn, i) => (
                          <button
                            key={i}
                            onClick={() => confirmAction(btn.action, index)}
                            className={`p-2 hover:bg-gray-100 rounded-full transition ${btn.color}`}
                            title={btn.label}
                          >
                            {btn.icon}
                          </button>
                        ))}
                        
                        <button 
                          onClick={() => confirmAction("delete", index)} 
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Surgery Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingIndex !== null ? "Editar Cirugía" : "Nueva Cirugía"}
                </h2>
                <button 
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {renderDateTime()}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect("Quirófano", formData.room, e => setFormData({ ...formData, room: e.target.value }), quirofanos, true, <ClipboardList size={16} />)}
                  {renderSelect("Procedimiento", formData.procedure, e => setFormData({ ...formData, procedure: e.target.value }), cirugias, true, <Scissors size={16} />)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelect("Cirujano Jefe", formData.surgeon, e => setFormData({ ...formData, surgeon: e.target.value }), cirujanos, true, <User size={16} />)}
                  {renderSelect("Soporte Médico", formData.support, e => setFormData({ ...formData, support: e.target.value }), soportes, false, <Zap size={16} />)}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {renderMultiSelect("Cirujanos Auxiliares", formData.assistants, auxiliares, "assistants", false, <Users size={16} />)}
                  {renderMultiSelect("Instrumentadores", formData.instrumenters, instrumentadores, "instrumenters", false, <Users size={16} />)}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <ClipboardList size={16} className="text-gray-500" />
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[80px]"
                    placeholder="Observaciones importantes..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button 
                  onClick={closeForm} 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md"
                >
                  {editingIndex !== null ? "Actualizar Cirugía" : "Programar Cirugía"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {action.type === "delete" && "¿Eliminar cirugía?"}
                {action.type === "start" && "¿Iniciar cirugía?"}
                {action.type === "pause" && "¿Pausar cirugía?"}
                {action.type === "complete" && "¿Completar cirugía?"}
                {action.type === "postpone" && "¿Posponer cirugía?"}
              </h3>
              <p className="text-gray-600 mb-4">
                {action.type === "delete" && "Esta acción no se puede deshacer. ¿Estás seguro de eliminar esta cirugía?"}
                {action.type === "start" && "¿Deseas marcar esta cirugía como 'En Progreso'?"}
                {action.type === "pause" && "¿Deseas pausar esta cirugía? Puedes reanudarla más tarde."}
                {action.type === "complete" && "¿Confirmas que esta cirugía ha sido completada?"}
                {action.type === "postpone" && "¿Deseas posponer esta cirugía? Deberás reagendarla para otra fecha."}
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmOpen(false)} 
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeAction} 
                  className={`px-4 py-2 rounded-lg transition text-white ${
                    action.type === "delete" ? "bg-red-600 hover:bg-red-700" :
                    action.type === "postpone" ? "bg-gray-600 hover:bg-gray-700" :
                    "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {action.type === "delete" && "Eliminar"}
                  {action.type === "start" && "Iniciar"}
                  {action.type === "pause" && "Pausar"}
                  {action.type === "complete" && "Completar"}
                  {action.type === "postpone" && "Posponer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
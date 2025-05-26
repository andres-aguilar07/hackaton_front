"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  FileText,
  Download,
  BarChart3,
  Activity,
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  X,
  Save,
  Building2,
  Stethoscope,
  UserCheck,
  Shield,
  BriefcaseMedical,
} from "lucide-react";
import TabButton from "../components/TabButton";

const Administrador = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("todos");
  const [showModalQuirofano, setShowModalQuirofano] = useState(false);
  // Estado para usuarios
  const [users, setUsers] = useState([]);
  // estado para quirofanos
  const [quirofanos, setQuirofanos] = useState([]);
  // Estado para roles
  const [roles, setRoles] = useState([]);
  // Estado para estadísticas
  const [statistics, setStatistics] = useState({
    cirugias_dia: 0,
    cirugias_en_curso: 0,
    incidentes_mes: 0,
    promedio_cirugias_dia: 0,
    quirofanos_activos: 0,
    usuarios_por_rol: []
  });

  const [newUser, setNewUser] = useState({
    nombre: "",
    apellido: "",
    email: "",
    cedula: "",
    telefono: "",
    rol_id: "",
    password: "",
    activo: true,
    fecha_nacimiento: "",
    direccion: "",
    tipo_sangre: "",
    alergias: "",
    condiciones_medicas: "",
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
  });
  const [newQuirofano, setNewQuirofano] = useState({
    nombre: "",
    numero: "",
    estado: "LIBRE",
    capacidad_personas: 10,
    equipamiento_especial: "",
    ubicacion: "",
    activo: true,
  });
  const openModal = (type) => {
    setModalType(type);
    if (type === "user") {
      setShowModal(true);
    }
    if (type === "quirofano") {
      setShowModalQuirofano(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewUser({
      nombre: "",
      apellido: "",
      email: "",
      cedula: "",
      telefono: "",
      rol_id: "",
      password: "",
      activo: true,
      fecha_nacimiento: "",
      direccion: "",
      tipo_sangre: "",
      alergias: "",
      condiciones_medicas: "",
      contacto_emergencia_nombre: "",
      contacto_emergencia_telefono: "",
    });
  };

  const handleSaveUser = async () => {
    try {
      if (newUser.rol_id === 5) {
        const userResponse = await fetch(`http://localhost:3000/api/v1/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newUser,
          }),
        });
        const userResult = await userResponse.json();

        if (userResult.success) {
          const patientResponse = await fetch(`http://localhost:3000/api/v1/admin/patients`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nombre: newUser.nombre,
              apellido: newUser.apellido,
              cedula: newUser.cedula,
              telefono: newUser.telefono,
              fecha_nacimiento: newUser.fecha_nacimiento || "",
              direccion: newUser.direccion || "",
              tipo_sangre: newUser.tipo_sangre || "",
              alergias: newUser.alergias || "",
              condiciones_medicas: newUser.condiciones_medicas || "",
              contacto_emergencia_nombre: newUser.contacto_emergencia_nombre || "",
              contacto_emergencia_telefono: newUser.contacto_emergencia_telefono || "",
            }),
          });
          const patientResult = await patientResponse.json();

          if (patientResult.success) {
            setUsers([...users, userResult.data]);
            closeModal();
          } else {
            console.error("Error al crear el paciente:", patientResult.message);
          }
        } else {
          console.error("Error al crear el usuario:", userResult.message);
        }
      } else {
        const response = await fetch(`http://localhost:3000/api/v1/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newUser,
          }),
        });
        const result = await response.json();

        if (result.success) {
          setUsers([...users, result.data]);
          closeModal();
        } else {
          console.error("Error al guardar el usuario:", result.message);
        }
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    }
  };

  const handleSaveQuirofano = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/admin/quirofanos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: newQuirofano.nombre,
          numero: newQuirofano.numero,
          categoria_id: 1, // Default value, should be updated based on categories
          capacidad_personas: newQuirofano.capacidad_personas,
          equipamiento_especial: newQuirofano.equipamiento_especial,
          ubicacion: newQuirofano.ubicacion,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setQuirofanos([...quirofanos, result.data]);
        setShowModalQuirofano(false);
        setNewQuirofano({
          nombre: "",
          numero: "",
          estado: "LIBRE",
          capacidad_personas: 10,
          equipamiento_especial: "",
          ubicacion: "",
          activo: true,
        });
      } else {
        console.error("Error al guardar el quirófano:", result.message);
      }
    } catch (error) {
      console.error("Error al guardar el quirófano:", error);
    }
  };

  const fetchQuirofanos = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/admin/quirofanos`);
      const result = await response.json();

      if (result.success) {
        setQuirofanos(result.data);
      } else {
        console.error("Error al obtener los quirófanos:", result.message);
      }
    } catch (error) {
      console.error("Error al obtener los quirófanos:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/admin/users`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        console.error("Error al obtener los usuarios:", result.message);
      }
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/admin/estadisticas`);
      const result = await response.json();
      if (result.success) {
        setStatistics(result.data);
      } else {
        console.error("Error al obtener las estadísticas:", result.message);
      }
    } catch (error) {
      console.error("Error al obtener las estadísticas:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/admin/roles`);
      const result = await response.json();
      if (result.success) {
        setRoles(result.data);
      } else {
        console.error("Error al obtener los roles:", result.message);
      }
    } catch (error) {
      console.error("Error al obtener los roles:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchQuirofanos();
    fetchStatistics();
    fetchRoles();
  }, []);

  const getRoleIcon = (rol_id) => {
    switch (rol_id) {
      case 1:
        return <Stethoscope className="w-4 h-4" />;
      case 4:
        return <UserCheck className="w-4 h-4" />;
      case 2:
        return <Shield className="w-4 h-4" />;
      case 3:
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleName = (rol_id) => {
    const roles = {
      1: "Cirujano",
      2: "Instrumentador",
      3: "Enfermera Jefe",
      4: "Médico",
      5: "Paciente",
    };
    return roles[rol_id] || "Desconocido";
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesRole =
      selectedRole === "todos" || user.rol_id.toString() === selectedRole;
    return matchesSearch && matchesRole;
  });

  const generatePDF = (surgery) => {
    // Simulación de generación de PDF
    alert(`Generando informe PDF para cirugía: ${surgery.procedimiento}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel Administrativo
              </h1>
              <p className="text-gray-600">Bienvenido, Juan Administrador</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              Lunes, 26 de Mayo 2025
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* tabs de navegacion  */}
        <div className="flex gap-4 mb-8">
          <TabButton
            id="usuarios"
            icon={Users}
            label="Gestión de Usuarios"
            active={activeTab === "usuarios"}
            onClick={setActiveTab}
          />
          {/* <TabButton
            id="informes"
            icon={FileText}
            label="Informes"
            active={activeTab === 'informes'}
            onClick={setActiveTab}
          />
          <TabButton
            id="estadisticas"
            icon={BarChart3}
            label="Estadísticas"
            active={activeTab === 'estadisticas'}
            onClick={setActiveTab}
          /> */}
          <TabButton
            id="quirofanos"
            icon={BriefcaseMedical}
            label="Quirofanos"
            active={activeTab === "quirofanos"}
            onClick={setActiveTab}
          />
        </div>

        {/* Panel de Usuarios */}
        {activeTab === "usuarios" && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Gestión de Personal Médico
                </h2>
                <button
                  onClick={() => openModal("user")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Agregar Usuario
                </button>
              </div>

              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="1">Cirujanos</option>
                  <option value="4">Médicos</option>
                  <option value="2">Instrumentadores</option>
                  <option value="3">Enfermeras Jefe</option>
                  <option value="5">Pacientes</option>
                </select>
              </div>
            </div>

            {/* Lista de usuarios */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Email
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Cédula
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Rol
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.rol_id)}
                          </div>
                          <span className="font-medium text-gray-900">{`${user.nombre} ${user.apellido}`}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{user.email}</td>
                      <td className="py-4 px-6 text-gray-600">{user.cedula}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {getRoleName(user.rol_id)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.activo
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Panel de quirofanos */}
        {activeTab === "quirofanos" && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Gestión de quirofanos
                </h2>
                <button
                  onClick={() => openModal("quirofano")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Agregar quirofanos
                </button>
              </div>

              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Lista de quirofanos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Número
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Estado
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Capacidad
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">
                      Ubicación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quirofanos.map((quirofano) => (
                    <tr
                      key={quirofano.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BriefcaseMedical className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {quirofano.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {quirofano.numero}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            quirofano.estado === "LIBRE"
                              ? "bg-green-100 text-green-800"
                              : quirofano.estado === "OCUPADO"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {quirofano.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {quirofano.capacidad_personas} personas
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {quirofano.ubicacion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Panel de Informes */}
        {activeTab === "informes" && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Informes de Cirugías
              </h2>
              <p className="text-gray-600 mt-1">
                Genera informes detallados de procedimientos quirúrgicos
              </p>
            </div>

            <div className="p-6">
              <div className="grid gap-6">
                {surgeries.map((surgery) => (
                  <div
                    key={surgery.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {surgery.procedimiento}
                        </h3>
                        <p className="text-gray-600">
                          Quirófano: {surgery.quirofano}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {surgery.estado}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Información del Procedimiento
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium">{surgery.fecha}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cirujano:</span>
                            <span className="font-medium">
                              {surgery.cirujano}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Instrumentador:
                            </span>
                            <span className="font-medium">
                              {surgery.instrumentador}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Control de Instrumentos
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Solicitados:</span>
                            <span className="font-medium">
                              {surgery.instrumentos.solicitados}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Utilizados:</span>
                            <span className="font-medium">
                              {surgery.instrumentos.utilizados}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Conteo correcto:
                            </span>
                            <span
                              className={`font-medium ${
                                surgery.instrumentos.contados
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {surgery.instrumentos.contados ? "✓ Sí" : "✗ No"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => generatePDF(surgery)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </button>
                      <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
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

        {/* Panel de Estadísticas */}
        {activeTab === "estadisticas" && (
          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Cirugías Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.cirugias_dia}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">En Curso</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.cirugias_en_curso}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Promedio Diario</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.promedio_cirugias_dia}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Incidentes</p>
                    <p className="text-2xl font-bold text-red-600">{statistics.incidentes_mes}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de actividad */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actividad Quirúrgica Semanal
              </h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                  (day, index) => {
                    const height = Math.random() * 200 + 50;
                    return (
                      <div
                        key={day}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-12 bg-blue-500 rounded-t-lg"
                          style={{ height: `${height}px` }}
                        ></div>
                        <span className="text-sm text-gray-600">{day}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Alertas y incidentes */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Incidentes Recientes
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Instrumento dañado - Q-02
                    </p>
                    <p className="text-sm text-gray-600">
                      Pinza Kelly dañada durante procedimiento. Reemplazada
                      exitosamente.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Riesgo de contaminación - Q-01
                    </p>
                    <p className="text-sm text-gray-600">
                      Protocolo de esterilización comprometido. Quirófano
                      cerrado temporalmente.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ayer, 14:30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para agregar usuario */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Agregar Nuevo Usuario
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newUser.nombre}
                    onChange={(e) =>
                      setNewUser({ ...newUser, nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={newUser.apellido}
                    onChange={(e) =>
                      setNewUser({ ...newUser, apellido: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Apellido"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula
                  </label>
                  <input
                    type="text"
                    value={newUser.cedula}
                    onChange={(e) =>
                      setNewUser({ ...newUser, cedula: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newUser.telefono}
                    onChange={(e) =>
                      setNewUser({ ...newUser, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="555-0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ingrese la contraseña"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={newUser.rol_id}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        rol_id: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre} - {rol.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newUser.rol_id === 5 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={newUser.fecha_nacimiento}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          fecha_nacimiento: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={newUser.direccion}
                      onChange={(e) =>
                        setNewUser({ ...newUser, direccion: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Sangre
                    </label>
                    <select
                      value={newUser.tipo_sangre}
                      onChange={(e) =>
                        setNewUser({ ...newUser, tipo_sangre: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Seleccionar tipo de sangre</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alergias
                    </label>
                    <input
                      type="text"
                      value={newUser.alergias}
                      onChange={(e) =>
                        setNewUser({ ...newUser, alergias: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Lista de alergias"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condiciones Médicas
                    </label>
                    <input
                      type="text"
                      value={newUser.condiciones_medicas}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          condiciones_medicas: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Condiciones médicas preexistentes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contacto de Emergencia
                    </label>
                    <input
                      type="text"
                      value={newUser.contacto_emergencia_nombre}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          contacto_emergencia_nombre: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Nombre del contacto de emergencia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono de Emergencia
                    </label>
                    <input
                      type="tel"
                      value={newUser.contacto_emergencia_telefono}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          contacto_emergencia_telefono: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Teléfono del contacto de emergencia"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveUser}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal para agregar quirofanos */}
      {showModalQuirofano && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Agregar Nuevo Usuario
              </h3>
              <button
                onClick={() => setShowModalQuirofano(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Quirófano
                </label>
                <input
                  type="text"
                  value={newQuirofano.nombre}
                  onChange={(e) =>
                    setNewQuirofano({ ...newQuirofano, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Quirofano Principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="number"
                  value={newQuirofano.numero}
                  onChange={(e) =>
                    setNewQuirofano({
                      ...newQuirofano,
                      numero: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={newQuirofano.estado}
                  onChange={(e) =>
                    setNewQuirofano({ ...newQuirofano, estado: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LIBRE">Libre</option>
                  <option value="OCUPADO">Ocupado</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad de Personas
                </label>
                <input
                  type="number"
                  value={newQuirofano.capacidad_personas}
                  onChange={(e) =>
                    setNewQuirofano({
                      ...newQuirofano,
                      capacidad_personas: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipamiento Especial
                </label>
                <input
                  type="text"
                  value={newQuirofano.equipamiento_especial}
                  onChange={(e) =>
                    setNewQuirofano({
                      ...newQuirofano,
                      equipamiento_especial: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Equipo de cirugía robótica"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={newQuirofano.ubicacion}
                  onChange={(e) =>
                    setNewQuirofano({
                      ...newQuirofano,
                      ubicacion: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Piso 3, Ala Norte"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveQuirofano}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={() => setShowModalQuirofano(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administrador;

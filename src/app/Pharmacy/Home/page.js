"use client";

import { useState } from "react";
import {
  Package,
  Boxes,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock as ClockIcon,
  Bell,
  Search,
  ArrowRight,
  Plus,
  X,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

const URGENCY_LEVELS = {
  HIGH: { label: "Urgente", style: "bg-red-100 text-red-800" },
  MEDIUM: { label: "Próxima", style: "bg-yellow-100 text-yellow-800" },
  LOW: { label: "Planificada", style: "bg-blue-100 text-blue-800" }
};

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Stock bajo: Gasa Estéril", urgency: "HIGH", date: "2025-05-26T09:00:00" },
  { id: 2, text: "Nueva solicitud: Sutura 3-0", urgency: "MEDIUM", date: "2025-05-26T10:15:00" }
];

const MOCK_INVENTORY = [
  { id: 1, name: "Jeringa 5ml", stock: 500, inUse: 45, min: 100 },
  { id: 2, name: "Gasa Estéril", stock: 120, inUse: 120, min: 200 },
  { id: 3, name: "Sutura 3-0", stock: 200, inUse: 25, min: 50 }
];

const MOCK_SCHEDULED = [
  { id: 1, surgery: "Apendicectomía", date: "2025-05-27T08:00:00", itemsNeeded: ["Jeringa 5ml", "Anestesia"] },
  { id: 2, surgery: "Colecistectomía", date: "2025-05-27T10:30:00", itemsNeeded: ["Gasa Estéril", "Sutura 3-0"] }
];

const MOCK_REQUESTS = [
  { id: 1, surgery: "Cesárea", urgency: "HIGH", items: ["Jeringa 5ml", "Guantes"], timestamp: "2025-05-26T11:30:00" },
  { id: 2, surgery: "Herniorrafia", urgency: "LOW", items: ["Gasas", "Sutura 3-0"], timestamp: "2025-05-26T12:00:00" }
];

const MOCK_ACTIVE = [
  { id: 1, name: "Artroscopia", room: "Quirófano 2", assignedItems: ["Jeringa 5ml", "Sutura 3-0"] },
  { id: 2, name: "Histerectomía", room: "Quirófano 3", assignedItems: ["Gasa Estéril", "Anestesia"] }
];

export default function HomePage() {
  const [tab, setTab] = useState("inventory");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filteredInv = MOCK_INVENTORY.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Package size={32} className="text-blue-600" />
          <div>
            <h1 className="text-3xl font-semibold">Central de Farmacia</h1>
            <p className="text-gray-500">Inventario y gestión quirúrgica</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setTab("notifications")}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex justify-center items-center">
                {notifications.length}
              </span>
            )}
          </button>
          {tab === "notifications" && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
              {notifications.map(n => (
                <div key={n.id} className="p-3 hover:bg-gray-50 flex items-start gap-2">
                  <AlertCircle
                    size={18}
                    className={
                      n.urgency === "HIGH"
                        ? "text-red-500"
                        : n.urgency === "MEDIUM"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }
                  />
                  <div>
                    <p className="text-sm">{n.text}</p>
                    <span className="text-xs text-gray-400">
                      {format(new Date(n.date), "dd/MM/yyyy, HH:mm:ss")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* TABS */}
      <nav className="flex gap-4 mb-6">
        {[
          { key: "inventory", label: "Inventario", icon: <Boxes /> },
          { key: "scheduled", label: "Programadas", icon: <CalendarIcon /> },
          { key: "requests", label: "Solicitudes", icon: <AlertCircle /> },
          { key: "active", label: "En Curso", icon: <ClockIcon /> }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full transition ${
              tab === t.key
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.icon}
            <span className="ml-1">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      {tab === "inventory" && (
        <section>
          <div className="flex mb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar ítem..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button className="ml-2 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition">
              <Plus />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInv.map(i => (
              <div key={i.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
                <h3 className="font-medium">{i.name}</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>Stock: <strong>{i.stock}</strong></p>
                  <p>En uso: <strong>{i.inUse}</strong></p>
                  <div>
                    Estado: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      i.stock > i.min
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>{i.stock > i.min ? "OK" : "Bajo"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "scheduled" && (
        <section className="space-y-4">
          {MOCK_SCHEDULED.map(s => (
            <div key={s.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{s.surgery}</h3>
                <span className="text-xs text-gray-500">{new Date(s.date).toLocaleString()}</span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {s.itemsNeeded.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ArrowRight size={16} />{it}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "requests" && (
        <section className="space-y-4">
          {MOCK_REQUESTS.map(r => (
            <div key={r.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{r.surgery}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${URGENCY_LEVELS[r.urgency].style}`}>
                  {URGENCY_LEVELS[r.urgency].label}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-2">
                {r.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ArrowRight size={16} />{it}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleString()}</span>
                <button className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">Entregar</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "active" && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ACTIVE.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{a.name}</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{a.room}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium">Asignados:</p>
                {a.assignedItems.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />{it}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
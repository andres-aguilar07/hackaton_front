"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Check,
  X
} from "lucide-react";

// Mock data - Replace with real API calls
const MOCK_SURGERIES = [
  {
    id: 1,
    name: "Apendicectomía",
    scheduledTime: "2025-05-27T08:00:00",
    room: "Quirófano 1",
    assignedTo: "Dr. Rodríguez",
    status: "pending"
  },
  {
    id: 2,
    name: "Colecistectomía",
    scheduledTime: "2025-05-27T10:30:00",
    room: "Quirófano 2",
    assignedTo: "Dra. Martínez",
    status: "pending"
  }
];

const INITIAL_CHECKLIST = [
  { id: 1, name: "Pinzas Kelly", status: "pending", quantity: 1 },
  { id: 2, name: "Tijeras Mayo", status: "pending", quantity: 1 },
  { id: 3, name: "Porta agujas", status: "pending", quantity: 1 },
  { id: 4, name: "Separadores", status: "pending", quantity: 2 }
];

const INITIAL_STATUS_OPTIONS = [
  { value: "present", label: "Presente" },
  { value: "missing", label: "Falta" },
  { value: "needMore", label: "Necesito más" }
];

const FINAL_STATUS_OPTIONS = [
  { value: "present", label: "Presente" },
  { value: "missing", label: "Falta" },
  { value: "damaged", label: "Dañado" }
];

export default function HomePage() {
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [step, setStep] = useState("list"); // list, precheck, counting, surgery, finalCount, completed
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [timer, setTimer] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [issues, setIssues] = useState("");

  useEffect(() => {
    let interval;
    if (step === "surgery") {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    let countdownInterval;
    if (countdownActive && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdownActive(false);
      setStep("surgery");
    }
    return () => clearInterval(countdownInterval);
  }, [countdownActive, countdown]);

  const startSurgery = (surgery) => {
    setSelectedSurgery(surgery);
    setStep("precheck");
  };

  const startInitialCount = () => setStep("counting");
  const confirmCount = () => { setCountdownActive(true); setCountdown(5); };
  const requestItem = (item) => alert(`Solicitud enviada: ${item}`);
  const finishSurgery = () => setStep("finalCount");
  const finalize = () => setStep("completed");
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Panel de Instrumentación</h1>
        <p className="text-gray-500">Control y seguimiento quirúrgico</p>
      </header>

      {step === "list" && (
        <section className="space-y-4">
          <h2 className="text-xl font-medium mb-4">Cirugías Asignadas</h2>
          {MOCK_SURGERIES.map(surgery => (
            <div key={surgery.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{surgery.name}</h3>
                  <p className="text-sm text-gray-600">Asignada a: {surgery.assignedTo}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {surgery.room}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Calendar size={16} />
                <span>{new Date(surgery.scheduledTime).toLocaleString()}</span>
              </div>
              <button
                onClick={() => startSurgery(surgery)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Iniciar Preparación
              </button>
            </div>
          ))}
        </section>
      )}

      {step === "precheck" && (
        <section>
          <h2 className="text-xl font-medium mb-4">Preparación de Cirugía</h2>
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            <h3 className="font-medium">{selectedSurgery?.name}</h3>
            <p className="text-sm text-gray-600">{selectedSurgery?.room}</p>
          </div>
          <button
            onClick={startInitialCount}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Iniciar Conteo Inicial
          </button>
        </section>
      )}

      {step === "counting" && (
        <section>
          <h2 className="text-xl font-medium mb-4">Conteo Inicial</h2>
          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-1/3">{item.name}</span>
                <div className="flex gap-2 flex-wrap">
                  {INITIAL_STATUS_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const newList = [...checklist];
                        newList[idx].status = option.value;
                        setChecklist(newList);
                      }}
                      className={`px-3 py-1 border rounded-lg text-sm ${item.status === option.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {item.status === "missing" && (
                  <button
                    onClick={() => requestItem(item.name)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                  >
                    Solicitar
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={confirmCount}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Confirmar Conteo
          </button>
          {countdownActive && (
            <div className="mt-4 text-center">
              <p className="text-lg">Confirmando en {countdown}...</p>
            </div>
          )}
        </section>
      )}

      {step === "surgery" && (
        <section>
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-medium">{selectedSurgery?.name}</h2>
              <span className="text-xl font-mono">{formatTime(timer)}</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Instrumentos Disponibles:</h3>
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-500" />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => requestItem("Nuevo instrumento")}
            className="w-full px-4 py-2 mb-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Solicitar Instrumentos Adicionales
          </button>
          <button
            onClick={finishSurgery}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Finalizar Cirugía
          </button>
        </section>
      )}

      {step === "finalCount" && (
        <section>
          <h2 className="text-xl font-medium mb-4">Conteo Final</h2>
          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-1/3">{item.name}</span>
                <div className="flex gap-2">
                  {FINAL_STATUS_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const newList = [...checklist];
                        newList[idx].status = option.value;
                        setChecklist(newList);
                      }}
                      className={`px-3 py-1 border rounded-lg text-sm ${item.status === option.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <textarea
              placeholder="Reportar incidencias..."
              value={issues}
              onChange={e => setIssues(e.target.value)}
              className="w-full p-3 border rounded-lg h-24 focus:outline-blue-500"
            />
          </div>
          <button
            onClick={finalize}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Completar
          </button>
        </section>
      )}

      {step === "completed" && (
        <div className="text-center py-10">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-medium">Cirugía Finalizada</h2>
          <p className="text-gray-600 mt-2">Gracias, el registro ha sido completado.</p>
        </div>
      )}
    </div>
  );
}

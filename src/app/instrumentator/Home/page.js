"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  CheckCircle,
  Check,
  X,
  AlertCircle,
  Plus,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare
} from "lucide-react";
import { startRecognition, speak } from "../../../utils/speechRecognition.js";
import { format } from "date-fns";

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
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastRecognizedText, setLastRecognizedText] = useState("");
  const [systemSpeaking, setSystemSpeaking] = useState(false);
  const [countingPhase, setCountingPhase] = useState("instructions"); // instructions, counting, review
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState("");
  const recognitionRef = useRef(null);
  const speakTimeoutRef = useRef(null);

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

  useEffect(() => {
    if (step === "counting" && voiceEnabled) {
      if (!recognitionRef.current) {
        recognitionRef.current = startRecognition(handleVoiceResult);
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [step, voiceEnabled]);

  useEffect(() => {
    if (isVoiceModalOpen && voiceEnabled && !systemSpeaking) {
      if (!recognitionRef.current) {
        recognitionRef.current = startRecognition(handleVoiceResult);
      }
      
      const timeoutId = setTimeout(() => {
        if (recognitionRef.current && !systemSpeaking) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
        }
      };
    }
  }, [isVoiceModalOpen, voiceEnabled, systemSpeaking]);

  const startSurgery = (surgery) => {
    setSelectedSurgery(surgery);
    setStep("precheck");
  };

  const startInitialCount = () => {
    setStep("counting");
    setVoiceEnabled(true);
    setCountingPhase("instructions");
    setCurrentItemIndex(0);
    setCurrentInstruction("");
    if (speakEnabled) {
      setSystemSpeaking(true);
      speak("Iniciando conteo inicial de instrumentos. Responda presente, falta, o necesito más para cada instrumento.")
        .then(() => {
          setSystemSpeaking(false);
          setCountingPhase("counting");
          setCurrentInstruction(`¿El instrumento \"${INITIAL_CHECKLIST[0].name}\" está presente?`);
          startListeningAfterDelay();
        });
    }
  };

  const startListeningAfterDelay = () => {
    setTimeout(() => {
      if (!systemSpeaking && recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }, 1000);
  };

  const confirmCount = () => {
    if (speakEnabled) {
      speak("Iniciando cuenta regresiva para comenzar la cirugía.");
    }
    setCountdownActive(true);
    setCountdown(5);
  };

  const requestItem = (item) => {
    if (speakEnabled) {
      speak(`Solicitando ${item}. Por favor espere.`);
    }
    alert(`Solicitud enviada: ${item}`);
  };

  const finishSurgery = () => {
    if (speakEnabled) {
      speak("Finalizando cirugía. Iniciando conteo final de instrumentos.");
    }
    setStep("finalCount");
  };

  const finalize = () => {
    if (speakEnabled) {
      speak("Cirugía completada. Gracias por su trabajo.");
    }
    setStep("completed");
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceResult = (transcript) => {
    if (step === "counting") {
      setLastRecognizedText(transcript);
      setIsListening(false);
      
      let status = null;
      let responseMessage = "";

      if (transcript.includes("presente") || transcript.includes("sí") || transcript.includes("si")) {
        status = "present";
        responseMessage = "Instrumento presente, registrado.";
      } else if (transcript.includes("falta") || transcript.includes("no")) {
        status = "missing";
        responseMessage = "Instrumento faltante, registrado.";
      } else if (transcript.includes("más") || transcript.includes("mas")) {
        status = "needMore";
        responseMessage = "Se necesitan más unidades, registrado.";
      }

      // Detenemos el reconocimiento actual
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      if (status) {
        const newList = [...checklist];
        newList[currentItemIndex].status = status;
        setChecklist(newList);
        
        setSystemSpeaking(true);
        speak(responseMessage).then(() => {
          setSystemSpeaking(false);
          if (currentItemIndex < checklist.length - 1) {
            moveToNextItem();
          } else {
            setCountingPhase("review");
            speak("Conteo inicial completado. Todos los instrumentos han sido verificados. Puede confirmar el conteo cuando esté listo.").then(() => {
              setSystemSpeaking(false);
              setVoiceEnabled(false);
            });
          }
        });
      } else {
        setSystemSpeaking(true);
        speak("No he entendido la respuesta. Por favor, diga presente, falta, o necesito más.").then(() => {
          setSystemSpeaking(false);
          // Reiniciamos el reconocimiento para el mismo elemento
          setTimeout(() => {
            recognitionRef.current = startRecognition(handleVoiceResult);
            if (recognitionRef.current) {
              recognitionRef.current.start();
              setIsListening(true);
              console.log('Reiniciando reconocimiento para el mismo elemento');
            }
          }, 500);
        });
      }
    }
  };

  const moveToNextItem = () => {
    const nextIndex = currentItemIndex + 1;
    const nextItem = checklist[nextIndex];
    
    // Primero actualizamos los estados
    setCurrentItemIndex(nextIndex);
    setCurrentInstruction(`¿El instrumento \"${nextItem.name}\" está presente?`);
    
    setSystemSpeaking(true);
    speak(`Siguiente elemento: ${nextItem.name}. Indique si está presente, falta o necesita más.`)
      .then(() => {
        setSystemSpeaking(false);
        
        // Detenemos el reconocimiento actual si existe
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
        
        // Iniciamos un nuevo reconocimiento después de un breve delay
        setTimeout(() => {
          recognitionRef.current = startRecognition(handleVoiceResult);
          if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
            console.log('Iniciando nuevo reconocimiento para siguiente elemento');
          }
        }, 500);
      });
  };

  const toggleVoiceRecognition = () => {
    if (voiceEnabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setVoiceEnabled(false);
      setIsListening(false);
      setIsVoiceModalOpen(false);
      setSystemSpeaking(true);
      speak("Reconocimiento de voz desactivado").then(() => {
        setSystemSpeaking(false);
      });
    } else {
      setVoiceEnabled(true);
      setCurrentItemIndex(0);
      setCountingPhase("instructions");
      setSystemSpeaking(true);
      speak("Reconocimiento de voz activado").then(() => {
        setSystemSpeaking(false);
      });
    }
  };

  useEffect(() => {
    if (countdownActive && speakEnabled) {
      speak(countdown.toString());
      if (countdown === 0) {
        speak("Cirugía iniciada. Puede solicitar instrumentos adicionales cuando lo necesite.");
      }
    }
  }, [countdown, countdownActive]);

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
                <span>{format(new Date(surgery.scheduledTime), "dd/MM/yyyy, HH:mm:ss")}</span>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Conteo Inicial</h2>
            <div className="flex gap-2 items-center">
              <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${voiceEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                <div className={`w-2 h-2 rounded-full ${voiceEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                Reconocimiento de Voz {voiceEnabled ? 'Activo' : 'Inactivo'}
              </div>
              <button
                onClick={() => setSpeakEnabled(!speakEnabled)}
                className={`p-2 rounded-lg ${speakEnabled ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
              >
                {speakEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>
          </div>

          {voiceEnabled && (
            <div className="mb-4 p-4 rounded-lg bg-gray-50 border">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={20} className="text-gray-600" />
                <span className="font-medium">Estado actual:</span>
              </div>
              <p className="text-gray-700 mb-2">{currentInstruction}</p>
              <p className="text-sm text-gray-600">Último texto reconocido: {lastRecognizedText || "Ningún texto reconocido aún"}</p>
            </div>
          )}

          {systemSpeaking && (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Volume2 size={20} />
              <span>Sistema hablando... espere por favor</span>
            </div>
          )}

          {isListening && voiceEnabled && !systemSpeaking && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse shadow-lg">
              <Mic size={20} />
              <span>Escuchando... Hable ahora</span>
            </div>
          )}

          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-4 rounded-lg ${idx === currentItemIndex && voiceEnabled ? 'bg-blue-50' : 'bg-white'}`}>
                <span className="w-1/3">{item.name}</span>
                <div className="flex gap-2 flex-wrap">
                  {INITIAL_STATUS_OPTIONS.map(option => {
                    let icon = null;
                    let colorClass = '';
                    
                    switch(option.value) {
                      case 'present':
                        icon = <Check size={16} />;
                        colorClass = 'bg-green-600 hover:bg-green-700';
                        break;
                      case 'missing':
                        icon = <X size={16} />;
                        colorClass = 'bg-red-600 hover:bg-red-700';
                        break;
                      case 'needMore':
                        icon = <Plus size={16} />;
                        colorClass = 'bg-yellow-600 hover:bg-yellow-700';
                        break;
                    }

                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          const newList = [...checklist];
                          newList[idx].status = option.value;
                          setChecklist(newList);
                        }}
                        className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1
                          ${item.status === option.value 
                            ? colorClass + ' text-white' 
                            : 'bg-white text-gray-700 border'}`}
                      >
                        {icon}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {item.status === "missing" && (
                  <button
                    onClick={() => requestItem(item.name)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <AlertCircle size={16} />
                    Solicitar
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={confirmCount}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
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


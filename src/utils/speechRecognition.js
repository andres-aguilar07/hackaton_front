export function createSpeechRecognition(onResultCallback, onErrorCallback) {
  try {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const SpeechGrammarList = window.webkitSpeechGrammarList || window.SpeechGrammarList;
    
    const recognition = new SpeechRecognition();
    const speechRecognitionList = new SpeechGrammarList();
    
    // Definimos la gramática para los comandos que queremos reconocer
    const grammar = '#JSGF V1.0; grammar commands; public <command> = presente | falta | necesito más | sí | no;';
    speechRecognitionList.addFromString(grammar, 1);
    
    recognition.grammars = speechRecognitionList;
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      onResultCallback(transcript);
      recognition.stop();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onErrorCallback(event.error);
      recognition.stop();
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    return {
      start: () => {
        try {
          recognition.start();
          console.log('Speech recognition started');
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          onErrorCallback("Error al iniciar el reconocimiento de voz");
        }
      },
      stop: () => {
        try {
          recognition.stop();
          console.log('Speech recognition stopped');
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    onErrorCallback("Tu navegador no soporta reconocimiento de voz");
    return null;
  }
}

export function speak(text) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech Synthesis no está soportado en este navegador');
      resolve(); // Resolvemos en lugar de rechazar para no interrumpir el flujo
      return;
    }

    // Cancelar cualquier síntesis anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Reducimos un poco la velocidad
    utterance.pitch = 1;
    utterance.volume = 1;

    let resolved = false;

    // Función para asegurar que la síntesis continúe
    const ensureSpeaking = () => {
      if (window.speechSynthesis.speaking && !resolved) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
        timeoutId = setTimeout(ensureSpeaking, 5000);
      }
    };

    let timeoutId = setTimeout(ensureSpeaking, 5000);

    // Función para manejar la finalización
    const handleEnd = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        resolve();
      }
    };

    // Función para manejar errores
    const handleError = (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        console.error('Error en síntesis de voz:', error);
        resolve(); // Resolvemos en lugar de rechazar para no interrumpir el flujo
      }
    };

    utterance.onend = handleEnd;
    utterance.onerror = handleError;

    // Intentar hablar con reintentos
    const maxRetries = 3;
    let retryCount = 0;

    const trySpeak = () => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error al intentar hablar:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(trySpeak, 1000);
        } else {
          handleError(error);
        }
      }
    };

    // Pequeña pausa antes de intentar hablar
    setTimeout(trySpeak, 100);
  });
}

export function startRecognition(onResultCallback, onErrorCallback = console.error) {
  try {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const SpeechGrammarList = window.webkitSpeechGrammarList || window.SpeechGrammarList;
    
    if (!SpeechRecognition) {
      throw new Error('El reconocimiento de voz no está soportado en este navegador');
    }
    
    const recognition = new SpeechRecognition();
    const speechRecognitionList = new SpeechGrammarList();
    
    // Definimos la gramática para los comandos que queremos reconocer
    const grammar = '#JSGF V1.0; grammar commands; public <command> = presente | falta | necesito más | sí | no;';
    speechRecognitionList.addFromString(grammar, 1);
    
    recognition.grammars = speechRecognitionList;
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      onResultCallback(transcript);
      recognition.stop();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onErrorCallback(event.error);
      recognition.stop();
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    return {
      start: () => {
        try {
          recognition.start();
          console.log('Speech recognition started');
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          onErrorCallback("Error al iniciar el reconocimiento de voz");
        }
      },
      stop: () => {
        try {
          recognition.stop();
          console.log('Speech recognition stopped');
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    onErrorCallback("Tu navegador no soporta reconocimiento de voz");
    return null;
  }
}
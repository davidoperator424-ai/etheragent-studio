import { useState, useCallback } from 'react';

interface DemoActions {
  navigate: (path: string) => void;
  setPrompt?: (text: string) => void;
}

export function useDemoScript() {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const runFullDemo = useCallback(async (actions: DemoActions) => {
    if (isDemoRunning) return;
    
    setIsDemoRunning(true);
    
    try {
      setCurrentStep('MARCUS: Analizando Mercado...');
      actions.navigate('/dashboard/nexus-brain');
      await new Promise(r => setTimeout(r, 1500));

      setCurrentStep('VIKTOR: Renderizando Espacialmente...');
      actions.navigate('/dashboard/ooh');
      await new Promise(r => setTimeout(r, 3000));

      setCurrentStep('ARIA: Modulando Frecuencia...');
      actions.navigate('/dashboard/sonic');
      await new Promise(r => setTimeout(r, 3000));

      setCurrentStep('NEXUS: Sincronizando Matriz...');
      actions.navigate('/dashboard/nexus');
      await new Promise(r => setTimeout(r, 3000));

      setCurrentStep('SISTEMA EN VIVO');
      
      if (Notification.permission === 'granted') {
        new Notification("COREOGRAFÍA COMPLETADA", {
          body: "EtherAgent OS está operando al 100% de capacidad.",
          icon: "/favicon.ico"
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification("COREOGRAFÍA COMPLETADA", {
              body: "EtherAgent OS está operando al 100% de capacidad.",
              icon: "/favicon.ico"
            });
          }
        });
      }

    } finally {
      setTimeout(() => {
        setIsDemoRunning(false);
        setCurrentStep('');
      }, 2000);
    }
  }, [isDemoRunning]);

  return { runFullDemo, isDemoRunning, currentStep };
}

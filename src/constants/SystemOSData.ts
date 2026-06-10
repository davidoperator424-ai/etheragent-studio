export const SYSTEM_OS_DATA = {
  agent: {
    name: "Marcus V.",
    role: "Director de Estrategia Analítica",
    avatarUrl: "https://njhifpbnrbbhbmwgedtz.supabase.co/storage/v1/object/public/visual-assets/marcus_avatar.jpg"
  },
  welcomeAudio: {
    id: 'ch_welcome',
    title: "Protocolo de Inicio",
    sender: "Marcus",
    text: "Bienvenido a la matriz de mando, Davicho. Los sistemas están en verde y listos para escalar. Haz clic en el botón inferior 'Iniciar Enlace Neuronal' para ejecutar la Demostración Ejecutiva.",
    audioFile: "ch_welcome.mp3"
  },
  modules: [
    { 
      id: 'ch_opt1', 
      title: "Centro de Operaciones", 
      description: "Audita y orquesta agentes",
      sender: "Marcus",
      text: "Sistemas en línea, CEO. Soy Marcus. Abriendo el centro de operaciones. ¿Qué métricas auditaremos hoy?",
      audioFile: "ch_opt1.mp3",
      path: "/dashboard/nexus-brain"
    },
    { 
      id: 'ch_opt2', 
      title: "Dominio Viral", 
      description: "Expansión en redes sociales",
      sender: "Marcus",
      text: "Iniciando protocolos de Dominio Viral. Valeria está en espera para procesar tus vectores de contenido.",
      audioFile: "ch_opt2.mp3",
      path: "/dashboard/social"
    },
    { 
      id: 'ch_opt3', 
      title: "Inyección Visual", 
      description: "Generación OOH",
      sender: "Marcus",
      text: "Abriendo matriz de inyección visual. Kaelen y Viktor están listos para dominar los espacios físicos y comerciales.",
      audioFile: "ch_opt3.mp3",
      path: "/dashboard/virtual-ooh"
    },
    { 
      id: 'ch_opt4', 
      title: "Comercialización", 
      description: "Task Replay Comercial",
      sender: "Marcus",
      text: "Iniciando Demostración Ejecutiva. Cargando matriz de misiones. Transfiriendo el control.",
      audioFile: "ch_opt4.mp3",
      path: "/dashboard/commercial-lab"
    }
  ]
};

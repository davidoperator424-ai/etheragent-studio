import React, { useState } from 'react';
import { Sequence, Video, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface SubtitleProps {
  text: string;
  startFrame: number;
  endFrame: number;
}

const Subtitle: React.FC<SubtitleProps> = ({ text, startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const entrance = spring({ fps, frame: frame - startFrame, config: { damping: 14, mass: 0.8 } });
  const opacity = interpolate(frame, [endFrame - 15, endFrame], [1, 0], { extrapolateRight: 'clamp' });
  
  if (frame < startFrame || frame > endFrame) return null;

  return (
    <div 
      style={{ 
        opacity, 
        transform: `scale(${entrance}) translate(-50%, 0)`,
        position: 'absolute',
        bottom: '380px',
        left: '50%',
        width: '85%',
        backgroundColor: 'rgba(10, 10, 10, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        padding: '35px 45px',
        border: '2px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <h1 style={{ 
        color: '#ffffff', 
        fontSize: '52px',
        fontWeight: '800', 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        letterSpacing: '-1.5px',
        lineHeight: '1.2',
        textAlign: 'center',
        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
        margin: 0
      }}>
        {text}
      </h1>
    </div>
  );
};

export const RemotionVideoOverlay: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <Video 
        src={videoUrl} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onLoad={() => setVideoLoaded(true)}
      />
      
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <span className="text-zinc-500 text-sm">Cargando video...</span>
        </div>
      )}
      
      {/* DIÁLOGO 1: El Pavo quejumbroso */}
      <Sequence from={15} durationInFrames={120}>
        <Subtitle text="Hermano... mi agencia de marketing me está desplumando." startFrame={15} endFrame={135} />
      </Sequence>
      
      {/* DIÁLOGO 2: El Jefe */}
      <Sequence from={145} durationInFrames={140}>
        <Subtitle text="Eso es porque sigues contratando humanos, Roberto." startFrame={145} endFrame={285} />
      </Sequence>

      {/* DIÁLOGO 3: El Remate */}
      <Sequence from={295} durationInFrames={135}>
        <Subtitle text="Yo los despedí a todos ayer. Ahora uso EtherAgent." startFrame={295} endFrame={430} />
      </Sequence>

      {/* DIÁLOGO 4: El Cierre de Autoridad */}
      <Sequence from={440} durationInFrames={140}>
        <Subtitle text="Resultados puros. Cero excusas. Salud." startFrame={440} endFrame={580} />
      </Sequence>
    </div>
  );
};

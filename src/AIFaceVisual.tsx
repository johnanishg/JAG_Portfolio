import { useEffect, useState } from 'react';

const AIFaceVisual = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-30">
      <svg
        width="800"
        height="800"
        viewBox="0 0 800 800"
        className={`transform transition-all duration-2000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        style={{ filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.3))' }}
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.8)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g className="ai-network">
          <circle cx="400" cy="250" r="6" fill="white" className="node-pulse" style={{ animationDelay: '0s' }} />
          <circle cx="500" cy="280" r="5" fill="white" className="node-pulse" style={{ animationDelay: '0.2s' }} />
          <circle cx="300" cy="280" r="5" fill="white" className="node-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="450" cy="350" r="5" fill="white" className="node-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="350" cy="350" r="5" fill="white" className="node-pulse" style={{ animationDelay: '0.8s' }} />
          <circle cx="250" cy="320" r="4" fill="white" className="node-pulse" style={{ animationDelay: '1s' }} />
          <circle cx="550" cy="320" r="4" fill="white" className="node-pulse" style={{ animationDelay: '1.2s' }} />

          <circle cx="320" cy="400" r="5" fill="white" className="node-pulse" style={{ animationDelay: '0.3s' }} />
          <circle cx="400" cy="420" r="6" fill="white" className="node-pulse" style={{ animationDelay: '0.5s' }} />
          <circle cx="480" cy="400" r="5" fill="white" className="node-pulse" style={{ animationDelay: '0.7s' }} />

          <circle cx="280" cy="470" r="4" fill="white" className="node-pulse" style={{ animationDelay: '0.9s' }} />
          <circle cx="350" cy="490" r="5" fill="white" className="node-pulse" style={{ animationDelay: '1.1s' }} />
          <circle cx="450" cy="490" r="5" fill="white" className="node-pulse" style={{ animationDelay: '1.3s' }} />
          <circle cx="520" cy="470" r="4" fill="white" className="node-pulse" style={{ animationDelay: '1.5s' }} />

          <circle cx="220" cy="380" r="3" fill="white" className="node-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="580" cy="380" r="3" fill="white" className="node-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="200" cy="450" r="3" fill="white" className="node-pulse" style={{ animationDelay: '0.8s' }} />
          <circle cx="600" cy="450" r="3" fill="white" className="node-pulse" style={{ animationDelay: '1s' }} />

          <circle cx="400" cy="550" r="6" fill="white" className="node-pulse" style={{ animationDelay: '0.2s' }} />
          <circle cx="330" cy="560" r="4" fill="white" className="node-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="470" cy="560" r="4" fill="white" className="node-pulse" style={{ animationDelay: '0.6s' }} />
        </g>

        <g className="connections" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" fill="none">
          <line x1="400" y1="250" x2="500" y2="280" className="connection-line" style={{ animationDelay: '0.1s' }} />
          <line x1="400" y1="250" x2="300" y2="280" className="connection-line" style={{ animationDelay: '0.2s' }} />
          <line x1="500" y1="280" x2="450" y2="350" className="connection-line" style={{ animationDelay: '0.3s' }} />
          <line x1="300" y1="280" x2="350" y2="350" className="connection-line" style={{ animationDelay: '0.4s' }} />
          <line x1="450" y1="350" x2="480" y2="400" className="connection-line" style={{ animationDelay: '0.5s' }} />
          <line x1="350" y1="350" x2="320" y2="400" className="connection-line" style={{ animationDelay: '0.6s' }} />
          <line x1="480" y1="400" x2="450" y2="490" className="connection-line" style={{ animationDelay: '0.7s' }} />
          <line x1="320" y1="400" x2="350" y2="490" className="connection-line" style={{ animationDelay: '0.8s' }} />
          <line x1="450" y1="490" x2="400" y2="550" className="connection-line" style={{ animationDelay: '0.9s' }} />
          <line x1="350" y1="490" x2="400" y2="550" className="connection-line" style={{ animationDelay: '1s' }} />

          <line x1="300" y1="280" x2="250" y2="320" className="connection-line" style={{ animationDelay: '0.3s' }} />
          <line x1="500" y1="280" x2="550" y2="320" className="connection-line" style={{ animationDelay: '0.4s' }} />
          <line x1="250" y1="320" x2="220" y2="380" className="connection-line" style={{ animationDelay: '0.5s' }} />
          <line x1="550" y1="320" x2="580" y2="380" className="connection-line" style={{ animationDelay: '0.6s' }} />
          <line x1="220" y1="380" x2="200" y2="450" className="connection-line" style={{ animationDelay: '0.7s' }} />
          <line x1="580" y1="380" x2="600" y2="450" className="connection-line" style={{ animationDelay: '0.8s' }} />

          <line x1="320" y1="400" x2="280" y2="470" className="connection-line" style={{ animationDelay: '0.6s' }} />
          <line x1="480" y1="400" x2="520" y2="470" className="connection-line" style={{ animationDelay: '0.7s' }} />
          <line x1="280" y1="470" x2="330" y2="560" className="connection-line" style={{ animationDelay: '0.8s' }} />
          <line x1="520" y1="470" x2="470" y2="560" className="connection-line" style={{ animationDelay: '0.9s' }} />

          <line x1="400" y1="420" x2="320" y2="400" className="connection-line" style={{ animationDelay: '0.5s' }} />
          <line x1="400" y1="420" x2="480" y2="400" className="connection-line" style={{ animationDelay: '0.6s' }} />
        </g>

        <g className="data-particles">
          <circle r="2" fill="#22d3ee" className="particle particle-1">
            <animateMotion dur="3s" repeatCount="indefinite" path="M400,250 Q450,265 500,280" />
          </circle>
          <circle r="2" fill="#3b82f6" className="particle particle-2">
            <animateMotion dur="3s" repeatCount="indefinite" path="M400,250 Q350,265 300,280" begin="0.5s" />
          </circle>
          <circle r="2" fill="#22d3ee" className="particle particle-3">
            <animateMotion dur="3s" repeatCount="indefinite" path="M500,280 Q475,315 450,350" begin="1s" />
          </circle>
          <circle r="2" fill="#3b82f6" className="particle particle-4">
            <animateMotion dur="3s" repeatCount="indefinite" path="M300,280 Q325,315 350,350" begin="1.5s" />
          </circle>
          <circle r="2" fill="#22d3ee" className="particle particle-5">
            <animateMotion dur="3s" repeatCount="indefinite" path="M450,350 Q465,375 480,400" begin="2s" />
          </circle>
          <circle r="2" fill="#3b82f6" className="particle particle-6">
            <animateMotion dur="3s" repeatCount="indefinite" path="M350,350 Q335,375 320,400" begin="2.5s" />
          </circle>
        </g>
      </svg>

      <style>{`
        .node-pulse {
          filter: url(#glow);
          animation: nodePulse 2s ease-in-out infinite;
        }

        @keyframes nodePulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }

        .connection-line {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawLine 2s ease-out forwards, pulseLine 3s ease-in-out infinite 2s;
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulseLine {
          0%, 100% {
            stroke: rgba(34, 211, 238, 0.3);
            stroke-width: 1;
          }
          50% {
            stroke: rgba(34, 211, 238, 0.6);
            stroke-width: 1.5;
          }
        }

        .particle {
          filter: url(#glow);
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default AIFaceVisual;

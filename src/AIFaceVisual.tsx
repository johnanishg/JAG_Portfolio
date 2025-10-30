import { useEffect, useState, useRef } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  animDurR: number;
  animDurO: number;
}

interface Line {
  id: string;
  from: Node;
  to: Node;
  opacity: number;
  animDurO: number;
  valuesO: string;
}

const AIFaceVisual = () => {
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]); // Keep nodes in a ref for animation

  // Device and performance detection
  const isMobile = typeof window !== 'undefined' && 
    (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  
  const isLowEndDevice = typeof window !== 'undefined' && 
    ((navigator as any).hardwareConcurrency && (navigator as any).hardwareConcurrency <= 4);

  // Adaptive settings based on device
  const numNodes = isMobile ? 40 : (isLowEndDevice ? 60 : 120);
  const maxConnectionDistance = isMobile ? 200 : (isLowEndDevice ? 250 : 300);
  const animationThrottle = isMobile ? 5 : (isLowEndDevice ? 4 : 3); // Skip more frames on slower devices
  const themeColors = ['#22d3ee', '#3b82f6', '#8b5cf6', '#ec4899']; // Cyan, Blue, Purple, Pink

  // Helper to generate random numbers
  const getRandom = (min: number, max: number): number => Math.random() * (max - min) + min;

  // Effect for initial network generation (runs once)
  useEffect(() => {
    setMounted(true);
    const generateInitialNetwork = () => {
      const newNodes = Array.from({ length: numNodes }).map(() => ({
        id: Math.random(),
        x: getRandom(0, 1920), // Use full width
        y: getRandom(0, 1080), // Use full height
        vx: getRandom(-0.3, 0.3), // Reduced velocity for smoother animation
        vy: getRandom(-0.3, 0.3),
        radius: getRandom(2, 4),
        opacity: getRandom(0.55, 0.9),
        color: themeColors[Math.floor(Math.random() * themeColors.length)],
        // Pre-calculate animation durations
        animDurR: getRandom(4, 8),
        animDurO: getRandom(3, 7),
      }));
      nodesRef.current = newNodes;
      setNodes(newNodes);
      
      // Calculate initial lines
      calculateLines(newNodes);
    };
    generateInitialNetwork();
  }, [numNodes, maxConnectionDistance]); // Re-generate if adaptive settings change

  // Function to calculate lines (called less frequently)
  const calculateLines = (currentNodes: Node[]) => {
    const newLines: Line[] = [];
    for (let i = 0; i < currentNodes.length; i++) {
      for (let j = i + 1; j < currentNodes.length; j++) {
        const dx = currentNodes[i].x - currentNodes[j].x;
        const dy = currentNodes[i].y - currentNodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxConnectionDistance) {
          const baseOpacity = (1 - (distance / maxConnectionDistance)) * 0.55;
          newLines.push({
            id: `${currentNodes[i].id}-${currentNodes[j].id}`,
            from: currentNodes[i],
            to: currentNodes[j],
            opacity: baseOpacity,
            // Pre-calculate animation values
            animDurO: getRandom(5, 15),
            valuesO: `${baseOpacity}; ${baseOpacity * 0.7}; ${baseOpacity}`,
          });
        }
      }
    }
    setLines(newLines);
  };

  // Effect for running the animation loop (runs once)
  useEffect(() => {
    let frameCount = 0;
    
    const animateNetwork = () => {
      // Update nodes in ref (faster, doesn't trigger re-renders)
      nodesRef.current = nodesRef.current.map(node => {
        let newX = node.x + node.vx;
        let newY = node.y + node.vy;

        // Bounce off edges
        if (newX < 0 || newX > 1920) node.vx *= -1;
        if (newY < 0 || newY > 1080) node.vy *= -1;

        // Keep within bounds
        newX = Math.max(0, Math.min(1920, newX));
        newY = Math.max(0, Math.min(1080, newY));

        return { ...node, x: newX, y: newY };
      });

      // Adaptive frame rate based on device capability
      frameCount++;
      if (frameCount % animationThrottle === 0) {
        setNodes([...nodesRef.current]);
        calculateLines(nodesRef.current);
      }
      
      animationFrameId.current = requestAnimationFrame(animateNetwork);
    };
    
    animationFrameId.current = requestAnimationFrame(animateNetwork);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once


  // GPU acceleration styles (only on desktop)
  const gpuStyles = isMobile ? {} : {
    transform: 'translate3d(0, 0, 0)',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={!isMobile ? { transform: 'translateZ(0)', willChange: 'transform' } : {}}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#1a1a3e] to-[#2d1b3d]" style={!isMobile ? { transform: 'translateZ(0)' } : {}} />
      
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        className={`transform transition-all duration-2000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        preserveAspectRatio="xMidYMid slice"
        shapeRendering={isMobile ? "auto" : "optimizeSpeed"}
        style={gpuStyles}
      >
        <defs>
          {/* Filters */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradients */}
          <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.8)" />
          </linearGradient>

        </defs>

        {/* --- Network Lines --- */}
        <g filter={isMobile ? "none" : "url(#glow)"} style={!isMobile ? { transform: 'translateZ(0)' } : {}}>
          {lines.map(line => (
            <line
              key={line.id}
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              stroke="rgba(59, 130, 246, 0.55)" // Thematic blue color for lines
              strokeWidth="1"
              opacity={line.opacity}
            >
              {!isMobile && (
                <animate 
                  attributeName="opacity" 
                  values={line.valuesO} 
                  dur={`${line.animDurO}s`} 
                  repeatCount="indefinite" 
                />
              )}
            </line>
          ))}
        </g>
        
        {/* --- Network Nodes --- */}
        <g filter={isMobile ? "none" : "url(#glow)"} style={!isMobile ? { transform: 'translateZ(0)' } : {}}>
          {nodes.map(node => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.color} // Use the assigned theme color
              opacity={node.opacity}
            >
              {!isMobile && (
                <>
                  <animate 
                    attributeName="r" 
                    values={`${node.radius}; ${node.radius * 1.2}; ${node.radius}`} 
                    dur={`${node.animDurR}s`} 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="opacity" 
                    values={`${node.opacity}; ${node.opacity * 0.7}; ${node.opacity}`} 
                    dur={`${node.animDurO}s`} 
                    repeatCount="indefinite" 
                  />
                </>
              )}
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default AIFaceVisual;


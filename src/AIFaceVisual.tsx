import { useEffect, useState, useRef, useMemo } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

interface Connection {
  from: number;
  to: number;
  baseOpacity: number;
}

// Performance detection with GPU check
const detectDeviceCapability = () => {
  if (typeof window === 'undefined') return { tier: 'low', hasGPU: false };
  
  const isMobile = window.innerWidth <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const cores = (navigator as any).hardwareConcurrency || 2;
  
  // Check for GPU/WebGL support
  let hasGPU = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    hasGPU = !!gl;
  } catch (e) {
    hasGPU = false;
  }
  
  // Determine device tier
  let tier: 'low' | 'medium' | 'high';
  if (isMobile || cores <= 2 || !hasGPU) {
    tier = 'low';
  } else if (cores <= 4) {
    tier = 'medium';
  } else {
    tier = 'high';
  }
  
  return { tier, hasGPU, isMobile };
};

const AIFaceVisual = () => {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const lastFrameTime = useRef<number>(0);
  
  // Detect device capability once
  const deviceCapability = useMemo(() => detectDeviceCapability(), []);
  const { tier, hasGPU } = deviceCapability;

  // Adaptive settings based on device tier
  const settings = useMemo(() => {
    switch (tier) {
      case 'low':
        return {
          numNodes: 25,
          maxConnectionDistance: 150,
          targetFPS: 30,
          enableAnimations: false,
          enableGlow: false,
          lineOpacityMultiplier: 0.4,
        };
      case 'medium':
        return {
          numNodes: 50,
          maxConnectionDistance: 200,
          targetFPS: 45,
          enableAnimations: true,
          enableGlow: false,
          lineOpacityMultiplier: 0.5,
        };
      case 'high':
      default:
        return {
          numNodes: 80,
          maxConnectionDistance: 250,
          targetFPS: 60,
          enableAnimations: true,
          enableGlow: true,
          lineOpacityMultiplier: 0.55,
        };
    }
  }, [tier]);

  const themeColors = ['#22d3ee', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Helper to generate random numbers
  const getRandom = (min: number, max: number): number => Math.random() * (max - min) + min;

  // Initialize nodes and canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1 : 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d', { 
        alpha: true,
        desynchronized: true // Better performance
      });
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Generate initial nodes
    const rect = canvas.getBoundingClientRect();
    const nodes: Node[] = Array.from({ length: settings.numNodes }, (_, i) => ({
      id: i,
      x: getRandom(0, rect.width),
      y: getRandom(0, rect.height),
      vx: getRandom(-0.2, 0.2),
      vy: getRandom(-0.2, 0.2),
      radius: getRandom(2, 3.5),
      opacity: getRandom(0.6, 0.9),
      color: themeColors[Math.floor(Math.random() * themeColors.length)],
    }));
    
    nodesRef.current = nodes;
    
    // Pre-calculate static connections (only recalculated when nodes move significantly)
    updateConnections();
    
    setMounted(true);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [settings.numNodes, tier]);

  // Spatial partitioning for efficient connection detection
  const updateConnections = () => {
    const nodes = nodesRef.current;
    const connections: Connection[] = [];
    const maxDist = settings.maxConnectionDistance;
    const maxDistSq = maxDist * maxDist; // Use squared distance to avoid sqrt

    // Simple O(n²) but optimized with early exit and squared distance
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const baseOpacity = (1 - (dist / maxDist)) * settings.lineOpacityMultiplier;
          connections.push({ from: i, to: j, baseOpacity });
        }
      }
    }
    
    connectionsRef.current = connections;
  };

  // Animation loop with adaptive FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true 
    });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const targetFrameTime = 1000 / settings.targetFPS;
    let connectionUpdateCounter = 0;
    const connectionUpdateInterval = tier === 'low' ? 30 : tier === 'medium' ? 20 : 15;

    const animate = (currentTime: number) => {
      // Frame rate limiting for consistent performance
      if (currentTime - lastFrameTime.current < targetFrameTime) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime.current = currentTime;

      // Update nodes
      const nodes = nodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > rect.width) node.vx *= -1;
        if (node.y < 0 || node.y > rect.height) node.vy *= -1;

        // Keep within bounds
        node.x = Math.max(0, Math.min(rect.width, node.x));
        node.y = Math.max(0, Math.min(rect.height, node.y));
        
        // Simple animation for radius and opacity (only on high-end devices)
        if (settings.enableAnimations) {
          const time = currentTime * 0.001;
          node.radius = node.radius + Math.sin(time + node.id) * 0.02;
          node.opacity = 0.6 + Math.sin(time * 0.5 + node.id) * 0.15;
        }
      }

      // Update connections periodically (not every frame)
      connectionUpdateCounter++;
      if (connectionUpdateCounter >= connectionUpdateInterval) {
        updateConnections();
        connectionUpdateCounter = 0;
      }

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw connections
      const connections = connectionsRef.current;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < connections.length; i++) {
        const conn = connections[i];
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        
        ctx.beginPath();
        ctx.globalAlpha = conn.baseOpacity;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        ctx.beginPath();
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.opacity;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect for high-end devices
        if (settings.enableGlow) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = node.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [settings, tier]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#1a1a3e] to-[#2d1b3d]" />
      
      {/* Canvas for network visualization */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          ...(hasGPU ? {
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
          } : {})
        }}
      />
    </div>
  );
};

export default AIFaceVisual;

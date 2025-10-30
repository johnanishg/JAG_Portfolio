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
  const [canvasError, setCanvasError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const lastFrameTime = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  
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

    let resizeTimeout: NodeJS.Timeout;
    
    // Set canvas size
    const updateCanvasSize = () => {
      // Use requestAnimationFrame for smooth resize
      requestAnimationFrame(() => {
        const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1 : 2);
        const rect = canvas.getBoundingClientRect();
        
        // Only update if size actually changed (avoid unnecessary work)
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          
          const ctx = canvas.getContext('2d', { 
            alpha: true,
            desynchronized: true
          });
          if (ctx) {
            ctx.scale(dpr, dpr);
          }
          
          // Reposition nodes if they're outside new bounds
          const nodes = nodesRef.current;
          if (nodes.length > 0) {
            for (let i = 0; i < nodes.length; i++) {
              nodes[i].x = Math.min(nodes[i].x, rect.width);
              nodes[i].y = Math.min(nodes[i].y, rect.height);
            }
            updateConnections();
          }
        }
      });
    };
    
    // Debounced resize handler for mobile
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 100);
    };
    
    updateCanvasSize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', updateCanvasSize);

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
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateCanvasSize);
      clearTimeout(resizeTimeout);
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

    let ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true 
    });
    if (!ctx) return;

    const targetFrameTime = 1000 / settings.targetFPS;
    let connectionUpdateCounter = 0;
    const connectionUpdateInterval = tier === 'low' ? 30 : tier === 'medium' ? 20 : 15;
    let isVisible = true;
    let isContextLost = false;

    // Get current canvas dimensions
    const getCanvasRect = () => {
      return canvas.getBoundingClientRect();
    };

    // Handle context loss (common on mobile)
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      console.log('Canvas context lost');
    };

    const handleContextRestored = () => {
      console.log('Canvas context restored');
      isContextLost = false;
      ctx = canvas.getContext('2d', { 
        alpha: true,
        desynchronized: true 
      });
      // Reinitialize canvas size
      const rect = getCanvasRect();
      const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1 : 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    // Handle visibility changes
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    // Add event listeners
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = (currentTime: number) => {
      // Skip animation if context is lost or page is hidden
      if (isContextLost || !isVisible || !ctx) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      // Frame rate limiting for consistent performance
      if (currentTime - lastFrameTime.current < targetFrameTime) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime.current = currentTime;

      // Get fresh canvas dimensions each frame (fixes mobile resize issues)
      const rect = getCanvasRect();
      
      // Validate canvas context is still good
      try {
        // Update nodes
        const nodes = nodesRef.current;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.x += node.vx;
          node.y += node.vy;

          // Bounce off edges with proper bounds
          if (node.x < 0 || node.x > rect.width) {
            node.vx *= -1;
            node.x = Math.max(0, Math.min(rect.width, node.x));
          }
          if (node.y < 0 || node.y > rect.height) {
            node.vy *= -1;
            node.y = Math.max(0, Math.min(rect.height, node.y));
          }
          
          // Simple animation for radius and opacity (only on high-end devices)
          if (settings.enableAnimations) {
            const time = currentTime * 0.001;
            node.radius = 2.5 + Math.sin(time + node.id) * 0.5;
            node.opacity = 0.65 + Math.sin(time * 0.5 + node.id) * 0.2;
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
          
          if (fromNode && toNode) {
            ctx.beginPath();
            ctx.globalAlpha = conn.baseOpacity;
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
          }
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
      } catch (error) {
        console.error('Canvas rendering error:', error);
        errorCountRef.current++;
        
        // If too many errors, disable canvas and show fallback
        if (errorCountRef.current > 10) {
          setCanvasError(true);
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
          }
          return;
        }
        
        // Context might be lost, try to recover
        isContextLost = true;
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Add a small delay before starting to ensure canvas is fully ready
    const startDelay = setTimeout(() => {
      animationFrameId.current = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(startDelay);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings, tier]);

  // Fallback: If canvas has persistent errors, just show gradient background
  if (canvasError) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#1a1a3e] to-[#2d1b3d]" />
      </div>
    );
  }

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
          } : {}),
          // Ensure canvas doesn't interfere with touch events
          touchAction: 'none',
        }}
      />
    </div>
  );
};

export default AIFaceVisual;

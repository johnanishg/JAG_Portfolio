import { useState, useEffect, useRef, useCallback } from 'react';
import { Github, Linkedin, Mail, Phone, ChevronDown, Award, Briefcase, GraduationCap, Code, ExternalLink } from 'lucide-react';
import AIFaceVisual from './AIFaceVisual';

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [atEdge, setAtEdge] = useState<'top' | 'bottom' | null>(null); // Two-step navigation for desktop wheel scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const scrollAccumulator = useRef(0);
  const scrollThreshold = 60;
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sections = ['home', 'about', 'experience', 'projects', 'skills', 'contact'];

  const canScrollInSection = useCallback((sectionIndex: number, direction: 'up' | 'down'): boolean => {
    const sectionElement = sectionRefs.current[sectionIndex];
    if (!sectionElement) return false;

    const scrollableElement = sectionElement.querySelector('[class*="overflow-y-auto"]') || sectionElement;
    
    if (scrollableElement instanceof HTMLElement) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
      return direction === 'down' 
        ? scrollTop + clientHeight < scrollHeight - 1
        : scrollTop > 1;
    }
    
    return false;
  }, []); // Empty deps since it only uses refs

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;

      const direction = e.deltaY > 0 ? 'down' : 'up';
      const canScroll = canScrollInSection(activeSection, direction);

      // If section has scrollable content, handle smooth scrolling
      if (canScroll) {
        const sectionElement = sectionRefs.current[activeSection];
        if (sectionElement) {
          const scrollableElement = sectionElement.querySelector('[class*="overflow-y-auto"]') || sectionElement;
          if (scrollableElement instanceof HTMLElement) {
            scrollableElement.scrollTop += e.deltaY * 0.85;
            setAtEdge(null);
          }
        }
        scrollAccumulator.current = 0;
        setScrollProgress(0);
        return;
      }

      // Two-step navigation: first scroll marks edge, second scroll switches section
      const isScrollingDown = e.deltaY > 0;
      const isScrollingUp = e.deltaY < 0;
      
      if ((atEdge === 'bottom' && isScrollingDown && activeSection < sections.length - 1) ||
          (atEdge === 'top' && isScrollingUp && activeSection > 0)) {
        scrollToSection(isScrollingDown ? activeSection + 1 : activeSection - 1);
        scrollAccumulator.current = 0;
        setScrollProgress(0);
        return;
      }
      
      // Mark edge on first scroll
      if (isScrollingDown && activeSection < sections.length - 1) {
        setAtEdge('bottom');
      } else if (isScrollingUp && activeSection > 0) {
        setAtEdge('top');
      }

      scrollAccumulator.current += e.deltaY;
      const progress = Math.min(Math.abs(scrollAccumulator.current) / scrollThreshold, 1);
      setScrollProgress(progress * 0.3);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;

      if ((e.key === 'ArrowDown' || e.key === 'PageDown') && activeSection < sections.length - 1) {
        e.preventDefault();
        scrollToSection(activeSection + 1);
      } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && activeSection > 0) {
        e.preventDefault();
        scrollToSection(activeSection - 1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const diff = touchStartY.current - touchEndY;
      const timeDiff = touchEndTime - touchStartTime.current;
      const velocity = Math.abs(diff) / timeDiff;
      
      const minSwipeDistance = 100;
      const minSwipeVelocity = 0.3;
      
      const target = e.target as HTMLElement;
      const scrollableElement = target.closest('[class*="overflow-y-auto"]') as HTMLElement;
      
      if (scrollableElement) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
        const isAtTop = scrollTop <= 2;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
        const isSwipingDown = diff > minSwipeDistance && velocity > minSwipeVelocity;
        const isSwipingUp = diff < -minSwipeDistance && velocity > minSwipeVelocity;
        
        if (isSwipingDown && isAtBottom && activeSection < sections.length - 1) {
          scrollToSection(activeSection + 1);
        } else if (isSwipingUp && isAtTop && activeSection > 0) {
          scrollToSection(activeSection - 1);
        }
      } else {
        const isSwipingDown = diff > minSwipeDistance;
        const isSwipingUp = diff < -minSwipeDistance;
        
        if (isSwipingDown && activeSection < sections.length - 1) {
          scrollToSection(activeSection + 1);
        } else if (isSwipingUp && activeSection > 0) {
          scrollToSection(activeSection - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeSection, isScrolling, atEdge, canScrollInSection]); // canScrollInSection is now memoized

  const scrollToSection = useCallback((index: number) => {
    setIsScrolling(true);
    setActiveSection(index);
    setAtEdge(null);

    setTimeout(() => {
      const sectionElement = sectionRefs.current[index];
      if (sectionElement) {
        const scrollableElement = sectionElement.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
        if (scrollableElement) {
          scrollableElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 50);

    setTimeout(() => setIsScrolling(false), 700);
  }, []); // Empty deps - uses refs and setState which are stable

  const getAnimationStyle = useCallback((index: number) => {
    const isActive = index === activeSection;
    const isPrevious = index < activeSection;
    const isNext = index > activeSection;
    const progress = scrollProgress;

    if (isActive) {
      if (isNext) {
        return {
          transform: `scale(${1 - progress * 0.2}) translateZ(0)`,
          opacity: 1 - progress,
          filter: `blur(${progress * 10}px)`,
        };
      }
      if (isPrevious) {
        const reverseProgress = 1 - progress;
        return {
          transform: `scale(${0.8 + reverseProgress * 0.2}) translateZ(0)`,
          opacity: reverseProgress,
          filter: `blur(${(1 - reverseProgress) * 10}px)`,
        };
      }
      return { transform: 'scale(1) translateZ(0)', opacity: 1, filter: 'blur(0px)' };
    }

    if (isPrevious || isNext) return { transform: 'scale(0.8) translateZ(0)', opacity: 0, filter: 'blur(10px)' };
    return { transform: 'scale(1) translateZ(0)', opacity: 1, filter: 'blur(0px)' };
  }, [activeSection, scrollProgress]);

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
      {/* Single AIFaceVisual instance for all sections */}
      <AIFaceVisual />
      
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 bg-transparent`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              JAG
            </div>
            <div className="hidden md:flex space-x-8">
              {sections.map((section, index) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(index)}
                  className={`capitalize transition-all duration-300 hover:text-cyan-400 ${
                    activeSection === index ? 'text-cyan-400 font-semibold' : 'text-gray-300'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative h-full w-full">
        <section
          ref={(el) => { sectionRefs.current[0] = el as HTMLDivElement; }}
          className="absolute inset-0 h-full w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] smooth-section"
          style={{ 
            zIndex: activeSection === 0 ? 10 : 0 - activeSection,
            ...getAnimationStyle(0)
          }}
        >
          <div className="h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent"></div>
            <div className="text-center z-10 px-6">
              <div className={`mb-6 sm:mb-8 relative inline-block group ${hasLoaded ? 'scale-in' : ''}`}
                   style={{ animationDelay: hasLoaded ? '0.2s' : '0s' }}>
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-75 group-hover:opacity-100 blur-xl transition duration-300 pulsate-glow"></div>
                <img
                  src="/JAG.jpeg"
                  alt="John Anish G"
                  className={`relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full object-cover border-4 border-slate-800 shadow-2xl transform transition-transform duration-500 group-hover:scale-105 ${
                    activeSection === 0 && !hasLoaded ? 'fade-in' : ''
                  }`}
                />
              </div>
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mt-2 mb-3 sm:mb-4 bg-clip-text text-transparent animate-gradient ${hasLoaded ? 'slide-up-fade' : ''}`}
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundImage: 'linear-gradient(90deg, rgb(34, 211, 238) 0%, rgb(59, 130, 246) 25%, rgb(34, 211, 238) 50%, rgb(59, 130, 246) 75%, rgb(34, 211, 238) 100%)',
                    backgroundSize: '200% 100%',
                    position: 'relative',
                    zIndex: 10,
                    lineHeight: '1.2',
                    marginBottom: '1rem',
                    animationDelay: hasLoaded ? '0.5s' : '0s',
                    opacity: hasLoaded ? undefined : 1,
                    transformStyle: 'preserve-3d'
                  }}>
                JOHN ANISH G
              </h1>
              <p className={`text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 ${hasLoaded ? 'slide-up-fade' : ''}`}
                 style={{ 
                   animationDelay: hasLoaded ? '0.8s' : '0s',
                   opacity: hasLoaded ? undefined : 1,
                   position: 'relative',
                   zIndex: 10,
                   marginTop: '0.5rem'
                 }}>
                AI & Machine Learning Engineer
              </p>
              <div className={`flex justify-center space-x-6 mb-12 ${hasLoaded ? 'slide-up-fade' : ''}`}
                   style={{ 
                     animationDelay: hasLoaded ? '1.1s' : '0s',
                     opacity: hasLoaded ? undefined : 1 
                   }}>
                <a href="https://github.com/johnanishg" target="_blank" rel="noopener noreferrer"
                   className={`transform transition-all duration-300 hover:scale-110 hover:text-cyan-400 ${hasLoaded ? 'slide-in-left' : ''}`}
                   style={{ 
                     animationDelay: hasLoaded ? '1.3s' : '0s',
                     opacity: hasLoaded ? undefined : 1 
                   }}>
                  <Github size={28} />
                </a>
                <a href="https://linkedin.com/in/johnanishg" target="_blank" rel="noopener noreferrer"
                   className={`transform transition-all duration-300 hover:scale-110 hover:text-cyan-400 ${hasLoaded ? 'slide-in-left' : ''}`}
                   style={{ 
                     animationDelay: hasLoaded ? '1.45s' : '0s',
                     opacity: hasLoaded ? undefined : 1 
                   }}>
                  <Linkedin size={28} />
                </a>
                <a href="mailto:johnanishg@gmail.com"
                   className={`transform transition-all duration-300 hover:scale-110 hover:text-cyan-400 ${hasLoaded ? 'slide-in-left' : ''}`}
                   style={{ 
                     animationDelay: hasLoaded ? '1.6s' : '0s',
                     opacity: hasLoaded ? undefined : 1 
                   }}>
                  <Mail size={28} />
                </a>
                <a href="tel:+916363717949"
                   className={`transform transition-all duration-300 hover:scale-110 hover:text-cyan-400 ${hasLoaded ? 'slide-in-left' : ''}`}
                   style={{ 
                     animationDelay: hasLoaded ? '1.75s' : '0s',
                     opacity: hasLoaded ? undefined : 1 
                   }}>
                  <Phone size={28} />
                </a>
              </div>
              <button
                onClick={() => scrollToSection(1)}
                className={`animate-bounce text-cyan-400 hover:text-cyan-300 transition-colors ${hasLoaded ? 'slide-up-fade' : ''}`}
                style={{ 
                  animationDelay: hasLoaded ? '2s' : '0s',
                  opacity: hasLoaded ? undefined : 1 
                }}>
                <ChevronDown size={40} />
              </button>
            </div>
          </div>
        </section>

        <section
          ref={(el) => { sectionRefs.current[1] = el as HTMLDivElement; }}
          className="absolute inset-0 h-full w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] smooth-section"
          style={{
            zIndex: activeSection === 1 ? 10 : 1 - activeSection,
            ...getAnimationStyle(1)
          }}
        >
          <div className="h-full flex items-center justify-center px-6 overflow-y-auto scrollbar-hide relative">
            <div className="max-w-5xl mx-auto w-full relative z-10">
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${
                activeSection === 1 ? 'section-title-animate title-glow-pulse' : ''
              }`}>
                About Me
              </h2>
              <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl hover:shadow-cyan-500/20 hover:scale-[1.02] hover:border-cyan-500/50 transition-all duration-500 ${
                activeSection === 1 ? 'pop-in' : ''
              }`}
              style={{
                animationDelay: activeSection === 1 ? '0.6s' : '0s'
              }}>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  AI & Machine Learning Engineering student with hands-on experience in predictive modeling, computer vision, and
                  full-stack development. I've developed automobile prognostic systems using ML algorithms and Raspberry Pi
                  integration, demonstrating my ability to bridge hardware and software solutions.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Proficient in Python, TensorFlow, PyTorch with demonstrated leadership in hackathon competitions.
                  Winner of technical hackathons and experienced in building AI-powered applications with TTS/STT integration.
                  I'm passionate about creating intelligent systems that solve real-world problems.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={(el) => { sectionRefs.current[2] = el as HTMLDivElement; }}
          className="absolute inset-0 h-full w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] smooth-section"
          style={{ 
            zIndex: activeSection === 2 ? 10 : 2 - activeSection,
            ...getAnimationStyle(2)
          }}
        >
          <div className="h-full pt-28 pb-12 px-6 overflow-y-auto scrollbar-hide relative">
            <div className="max-w-6xl mx-auto">
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center flex-wrap gap-2 px-4 ${
                activeSection === 2 ? 'section-title-animate title-glow-pulse' : ''
              }`}>
                <Briefcase className="flex-shrink-0" size={28} />
                <span>Work Experience</span>
              </h2>
              <div className="space-y-8">
                {[
                  {
                    role: "AI Application Developer Intern",
                    company: "IT Catalyst Software Pvt Ltd, Bengaluru",
                    period: "Oct 2025 - Present",
                    points: [
                      "Building TallyCatalyst along with AI based Dashboard Generator",
                      "Learning Tally Prime software and understanding the backend of it"
                    ]
                  },
                  {
                    role: "Machine Learning Intern",
                    company: "EvolveTech, Bengaluru",
                    period: "Jun 2025 - Oct 2025",
                    points: [
                      "Developing ASR systems using PyTorch for real-time speech transcription",
                      "Building Transformer-based Grammatical Error Correction models with attention mechanisms",
                      "Implementing neural Indian Accent TTS systems using XTTS_v2 architectures",
                      "Creating production ML pipelines and FastAPIs for multi-model AI integration"
                    ]
                  },
                  {
                    role: "AI Intern",
                    company: "Skillicon Technologies, Bengaluru",
                    period: "Nov 2024 - Jun 2025",
                    points: [
                      "Built automobile prognostic system using Raspberry Pi, CAN module, and ML models for failure prediction",
                      "Developed Driver Behavior Analysis models using machine learning for automotive safety applications",
                      "Created Real-Time Vehicle Monitoring solution with predictive maintenance capabilities"
                    ]
                  },
                  {
                    role: "Python, ML & DS Intern",
                    company: "Teragon, Hassan",
                    period: "Nov 2023 - Dec 2023",
                    points: [
                      "Applied machine learning algorithms and statistical analysis in real-world scenarios",
                      "Developed data visualization solutions and gained hands-on ML project experience"
                    ]
                  }
                ].map((job, index) => {
                  const shouldAnimate = activeSection === 2;
                  const isEven = index % 2 === 0;
                  return (
                  <div key={index}
                       className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/20 transform hover:-translate-y-2 hover:scale-[1.02] ${
                         shouldAnimate ? (isEven ? 'comb-slide-left' : 'comb-slide-right') : ''
                       }`}
                       style={{
                         animationDelay: shouldAnimate ? `${0.7 + index * 0.2}s` : '0s'
                       }}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">{job.role}</h3>
                        <p className="text-gray-300 font-semibold">{job.company}</p>
                      </div>
                      <span className="text-gray-400 mt-2 md:mt-0">{job.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {job.points.map((point, i) => (
                        <li key={i} className="text-lg text-gray-300 leading-relaxed flex items-start">
                          <span className="text-cyan-400 mr-2 mt-1">▹</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          ref={(el) => { sectionRefs.current[3] = el as HTMLDivElement; }}
          className="absolute inset-0 h-full w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] smooth-section"
          style={{
            zIndex: activeSection === 3 ? 10 : 3 - activeSection,
            ...getAnimationStyle(3)
          }}
        >
          <div className="h-full pt-28 pb-12 px-6 overflow-y-auto scrollbar-hide relative">
            <div className="max-w-6xl mx-auto">
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center flex-wrap gap-2 px-4 ${
                activeSection === 3 ? 'section-title-animate title-glow-pulse' : ''
              }`}>
                <Award className="flex-shrink-0" size={28} />
                <span>Featured Projects</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: "MedAlert: AI based medicine alert system",
                    badge: "Healthcare AI",
                    description: "Medicine alert system designed for patients and elderly care with multi-platform support",
                    points: [
                      "Built comprehensive medicine alert system with website, Android app, and AOSP-based device",
                      "Developed multi-language support for English, Kannada, and Hindi with TTS/STT integration",
                      "Implemented AI-powered voice alerts using Hugging Face transformers for accessibility"
                    ]
                  },
                  {
                    title: "Stock Market Prediction System",
                    badge: "Enigma Hackathon Winner",
                    description: "Won 1st place at Enigma Hackathon, Jyothi Institute of Technology, Bengaluru (Dec 2024)",
                    points: [
                      "Developed ensemble forecasting system using LSTM and XGBoost for real-time stock price prediction",
                      "Implemented backtesting framework with technical indicators and sentiment analysis",
                      "Achieved superior prediction accuracy through hybrid deep learning and gradient boosting approach"
                    ]
                  },
                  {
                    title: "Shrikaa AI",
                    badge: "English Learning Tool",
                    description: "AI-powered learning application with advanced NLP capabilities",
                    points: [
                      "Built AI-powered learning application with NLP capabilities and TTS/STT integration",
                      "Implemented custom speech processing models for pronunciation assessment and feedback"
                    ]
                  },
                  {
                    title: "Automobile Prognostic System",
                    badge: "IoT & ML",
                    description: "Predictive maintenance system for automotive applications",
                    points: [
                      "Designed IoT-based predictive maintenance system with real-time monitoring dashboard",
                      "Integrated ensemble ML algorithms for vehicle diagnostics and behavior analysis"
                    ]
                  },
                  
                ].map((project, index) => {
                  const shouldAnimate = activeSection === 3;
                  return (
                  <div key={index}
                       className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/25 transform hover:-translate-y-3 hover:scale-105 group ${
                         shouldAnimate ? 'pop-in' : ''
                       }`}
                       style={{
                         animationDelay: shouldAnimate ? `${0.7 + index * 0.2}s` : '0s'
                       }}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-all duration-300">{project.title}</h3>
                      <ExternalLink className="text-gray-400 group-hover:text-cyan-400 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" size={20} />
                    </div>
                    <span className="inline-block bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm mb-3">
                      {project.badge}
                    </span>
                    <p className="text-gray-300 mb-4">{project.description}</p>
                    <ul className="space-y-2">
                      {project.points.map((point, i) => (
                        <li key={i} className="text-gray-400 text-sm flex items-start">
                          <span className="text-cyan-400 mr-2">▹</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          ref={(el) => { sectionRefs.current[4] = el as HTMLDivElement; }}
          className="absolute inset-0 h-full w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] smooth-section"
          style={{ 
            zIndex: activeSection === 4 ? 10 : 4 - activeSection,
            ...getAnimationStyle(4)
          }}
        >
          <div className="h-full pt-28 pb-12 px-6 overflow-y-auto scrollbar-hide relative">
            <div className="max-w-6xl mx-auto">
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center flex-wrap gap-2 px-4 ${
                activeSection === 4 ? 'section-title-animate title-glow-pulse' : ''
              }`}>
                <Code className="flex-shrink-0" size={28} />
                <span>Technical Skills</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    category: "Programming & Web Development",
                    skills: ["Python", "Java", "JavaScript", "Node.js", "React.js", "FastAPI", "Streamlit", "Flask", "Full-Stack Development"]
                  },
                  {
                    category: "AI/ML & Data Science",
                    skills: ["PyTorch", "TensorFlow", "Hugging Face Transformers", "Scikit-learn", "Deep Learning", "Computer Vision", "NLP", "ASR Systems", "TTS"]
                  },
                  {
                    category: "Database & Cloud Technologies",
                    skills: ["MySQL", "MongoDB", "PostgreSQL", "AWS", "GCP", "Docker", "Git"]
                  },
                  {
                    category: "Tools & Platforms",
                    skills: ["ChatGPT", "Claude", "VS Code", "Cursor", "Warp", "Github Copilot", "Bolt", "Raspberry Pi", "Tableau"]
                  }
                ].map((category, index) => {
                  const shouldAnimate = activeSection === 4;
                  return (
                  <div key={index}
                       className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/15 transition-all duration-500 hover:scale-105 ${
                         shouldAnimate ? 'pop-in' : ''
                       }`}
                       style={{
                         animationDelay: shouldAnimate ? `${0.7 + index * 0.2}s` : '0s'
                       }}>
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">{category.category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, i) => (
                        <span key={i}
                              className="bg-slate-700/50 px-3 py-1 rounded-lg text-sm text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all duration-300 cursor-default hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30 stagger-fade"
                              style={{ animationDelay: shouldAnimate ? `${1.5 + i * 0.05}s` : '0s' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className={`mt-12 bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/15 transition-all duration-500 ${
                activeSection === 4 ? 'pop-in' : ''
              }`}
              style={{
                animationDelay: activeSection === 4 ? '1.8s' : '0s'
              }}>
                <div className="flex items-start">
                  <GraduationCap className="text-cyan-400 mr-4 mt-1 flex-shrink-0" size={32} />
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-400 mb-2">Education</h3>
                    <p className="text-xl text-gray-200 font-semibold mb-1">Bachelor of Engineering in Artificial Intelligence and Machine Learning</p>
                    <p className="text-gray-300 mb-2">Global Academy of Technology | Nov 2022 - Jul 2026</p>
                    <p className="text-gray-400">CGPA: 7.42 (6 Semesters)</p>
                    <p className="text-gray-400 mt-2">Relevant Coursework: ML, Deep Learning, NLP, Computer Vision, Neural Networks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={(el) => { sectionRefs.current[5] = el as HTMLDivElement; }}
          className="absolute inset-0 h-full w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] smooth-section"
          style={{
            zIndex: activeSection === 5 ? 10 : 5 - activeSection,
            ...getAnimationStyle(5)
          }}
        >
          <div className="h-full flex items-center pt-28 pb-20 px-6 relative">
            <div className="max-w-4xl mx-auto text-center w-full relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Get In Touch
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12">
                I'll always be looking for new opportunities and collaborations. Whether you have a question or just want to say Hi,
                I'll do my best to get back to you!
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <a href="mailto:johnanishg@gmail.com"
                   className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-1 flex items-center justify-center group">
                  <Mail className="mr-3 text-cyan-400 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-gray-300">johnanishg@gmail.com</span>
                </a>
                <a href="tel:+916363717949"
                   className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-1 flex items-center justify-center group">
                  <Phone className="mr-3 text-cyan-400 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-gray-300">+91 6363717949</span>
                </a>
              </div>
              <div className="flex justify-center space-x-6">
                <a href="https://github.com/johnanishg" target="_blank" rel="noopener noreferrer"
                   className="bg-slate-800/50 backdrop-blur-sm rounded-full p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-1 hover:scale-110">
                  <Github size={32} className="text-cyan-400" />
                </a>
                <a href="https://linkedin.com/in/johnanishg" target="_blank" rel="noopener noreferrer"
                   className="bg-slate-800/50 backdrop-blur-sm rounded-full p-4 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-1 hover:scale-110">
                  <Linkedin size={32} className="text-cyan-400" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-2">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === index
                ? 'bg-cyan-400 scale-125'
                : 'bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-transparent py-4 text-center z-40">
        <p className="text-gray-400 text-sm">Designed & Built by John Anish G</p>
      </footer>
    </div>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Mail, Phone, ChevronDown, Award, Briefcase, GraduationCap, Code, ExternalLink } from 'lucide-react';

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const sections = ['home', 'about', 'experience', 'projects', 'skills', 'contact'];

  useEffect(() => {
    let wheelTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling) return;

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0 && activeSection < sections.length - 1) {
          scrollToSection(activeSection + 1);
        } else if (e.deltaY < 0 && activeSection > 0) {
          scrollToSection(activeSection - 1);
        }
      }, 50);
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
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;

      if (Math.abs(diff) > 50) {
        if (diff > 0 && activeSection < sections.length - 1) {
          scrollToSection(activeSection + 1);
        } else if (diff < 0 && activeSection > 0) {
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
      clearTimeout(wheelTimeout);
    };
  }, [activeSection, isScrolling]);

  const scrollToSection = (index: number) => {
    setIsScrolling(true);
    setActiveSection(index);

    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  const getAnimationClass = (index: number) => {
    if (index === activeSection) {
      return 'translate-x-0 opacity-100 scale-100 rotate-0';
    } else if (index < activeSection) {
      return '-translate-x-full opacity-0 scale-95 -rotate-2';
    } else {
      return 'translate-x-full opacity-0 scale-95 rotate-2';
    }
  };

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${activeSection > 0 ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
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
          className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out transform ${getAnimationClass(0)}`}
          style={{ zIndex: activeSection === 0 ? 10 : 0 - activeSection }}
        >
          <div className="h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent"></div>
            <div className="text-center z-10 px-6">
              <div className="mb-8 relative inline-block group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                <img
                  src="/WhatsApp Image 2025-10-29 at 12.34.07.jpeg"
                  alt="John Anish G"
                  className="relative w-48 h-48 rounded-full object-cover border-4 border-slate-800 shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                JOHN ANISH G
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">AI & Machine Learning Engineer</p>
              <div className="flex justify-center space-x-6 mb-12">
                <a href="https://github.com/johnanishg" target="_blank" rel="noopener noreferrer"
                   className="transform transition-all duration-300 hover:scale-110 hover:text-cyan-400">
                  <Github size={28} />
                </a>
                <a href="https://linkedin.com/in/johnanishg" target="_blank" rel="noopener noreferrer"
                   className="transform transition-all duration-300 hover:scale-110 hover:text-cyan-400">
                  <Linkedin size={28} />
                </a>
                <a href="mailto:johnanishg@gmail.com"
                   className="transform transition-all duration-300 hover:scale-110 hover:text-cyan-400">
                  <Mail size={28} />
                </a>
                <a href="tel:+916363717949"
                   className="transform transition-all duration-300 hover:scale-110 hover:text-cyan-400">
                  <Phone size={28} />
                </a>
              </div>
              <button
                onClick={() => scrollToSection(1)}
                className="animate-bounce text-cyan-400 hover:text-cyan-300 transition-colors">
                <ChevronDown size={40} />
              </button>
            </div>
          </div>
        </section>

        <section
          className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out transform ${getAnimationClass(1)}`}
          style={{ zIndex: activeSection === 1 ? 10 : 1 - activeSection }}
        >
          <div className="h-full flex items-center py-20 px-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full">
              <h2 className="text-5xl font-bold mb-12 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                About Me
              </h2>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
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
          className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out transform ${getAnimationClass(2)}`}
          style={{ zIndex: activeSection === 2 ? 10 : 2 - activeSection }}
        >
          <div className="h-full py-20 px-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                <Briefcase className="inline-block mr-3 mb-2" size={48} />
                Work Experience
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
                ].map((job, index) => (
                  <div key={index}
                       className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-cyan-400 mb-1">{job.role}</h3>
                        <p className="text-gray-300 font-semibold">{job.company}</p>
                      </div>
                      <span className="text-gray-400 mt-2 md:mt-0">{job.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {job.points.map((point, i) => (
                        <li key={i} className="text-gray-300 flex items-start">
                          <span className="text-cyan-400 mr-2">▹</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out transform ${getAnimationClass(3)}`}
          style={{ zIndex: activeSection === 3 ? 10 : 3 - activeSection }}
        >
          <div className="h-full py-20 px-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                <Award className="inline-block mr-3 mb-2" size={48} />
                Featured Projects
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
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
                  }
                ].map((project, index) => (
                  <div key={index}
                       className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-2 group">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">{project.title}</h3>
                      <ExternalLink className="text-gray-400 group-hover:text-cyan-400 transition-colors" size={20} />
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
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out transform ${getAnimationClass(4)}`}
          style={{ zIndex: activeSection === 4 ? 10 : 4 - activeSection }}
        >
          <div className="h-full py-20 px-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                <Code className="inline-block mr-3 mb-2" size={48} />
                Technical Skills
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
                    skills: ["MySQL", "MongoDB", "PostgreSQL", "AWS", "Docker", "Git"]
                  },
                  {
                    category: "Tools & Platforms",
                    skills: ["ChatGPT", "Claude", "VS Code", "Cursor", "Warp", "Github Copilot", "Bolt", "Raspberry Pi", "Tableau"]
                  }
                ].map((category, index) => (
                  <div key={index}
                       className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-500">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4">{category.category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, i) => (
                        <span key={i}
                              className="bg-slate-700/50 px-3 py-1 rounded-lg text-sm text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all duration-300 cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
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
          className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out transform ${getAnimationClass(5)}`}
          style={{ zIndex: activeSection === 5 ? 10 : 5 - activeSection }}
        >
          <div className="h-full flex items-center py-20 px-6">
            <div className="max-w-4xl mx-auto text-center w-full">
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Get In Touch
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                I'm currently looking for new opportunities and collaborations. Whether you have a question or just want to say hi,
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

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/50 border-t border-slate-800 py-4 text-center z-40">
        <p className="text-gray-400 text-sm">Designed & Built by John Anish G</p>
      </footer>
    </div>
  );
}

export default App;

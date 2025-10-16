import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarkdownViewer } from "../components/MarkdownViewer";
import 'animate.css';

export function HomePage() {
  const [heroAnimation, setHeroAnimation] = useState('');
  const [containerAnimation, setContainerAnimation] = useState('');
  // MUDANÇA AQUI: Renomeei para ser mais claro
  const [position, setPosition] = useState<'absolute' | 'relative'>('absolute');
  const [visibility, setVisibility] = useState<'hidden' | 'visible'>('hidden');

  // useEffect(() => {
  //   const timer2 = setTimeout(() => {
  //     setContainerAnimation('animate__lightSpeedInRight');
  //     setVisibility('visible'); // Agora isso vai funcionar!


  //     // Após iniciar a segunda animação, muda para position relative
  //     setTimeout(() => {
  //       setPosition('relative'); // Agora isso vai funcionar!
  //     }, 100); 
  //   }, 3000); 

  //   return () => {
  //     clearTimeout(timer2);
  //   };
  // }, []);

  return (
    <div className="home-page">
      {/* MUDANÇA AQUI: Adicionei a variável de animação do estado */}
      <div 
      className={`min-h-screen hero`}>
        <div 
          id="hero-container"
          className={`hero-container animate__animated animate__lightSpeedInRight `}
        >
          <div className="hero-content h-[80vh]">
            <img src="/logo-120.png" alt="Falai Agent" className="" />
          </div>
          <h1 className="text-4xl font-bold text-center font-comfortaa-bold gradient-text-animated">@falai/agent</h1>
          <p className="hero-subtitle">
            Build intelligent, conversational AI agents with TypeScript
          </p>
          <div className="hero-tags">
            <span className="tag">Standalone</span>
            <span className="tag">Strongly-Typed</span>
            <span className="tag">Production-Ready</span>
          </div>
          <div className="hero-actions">
            <a href="#-quick-start" className="btn gradient-animated">
              Quick Start
            </a>
            <Link to="/docs/getting-started" className="btn btn-secondary">
              Documentation
            </Link>
          </div>
        </div>
      </div>
      <div className="readme-content">
        <MarkdownViewer path="/content/README.md" />
      </div>
    </div>
  );
}
import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive, duration = 3000 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 150;
    const colors = ['#f97316', '#fbbf24', '#ffffff', '#3b82f6', '#a855f7'];

    class Particle {
      x: number;
      y: number;
      color: string;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = canvas!.width / 2;
        this.y = canvas!.height / 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 8 + 4;
        this.speedX = (Math.random() - 0.5) * 15;
        this.speedY = (Math.random() - 0.5) * 15;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.1; // Gravity
        this.speedX *= 0.99; // Air resistance
        this.rotation += this.rotationSpeed;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    // Initialize particles (explosion effect)
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      if (Date.now() - startTime > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.update();
        p.draw();
        // Remove particles that go off screen
        if (p.y > canvas.height + 100) {
            particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, duration]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
    />
  );
};

export default Confetti;

/* eslint-disable consistent-return */

import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/themeContext.tsx';


class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  size: number = 0;
  color: string = '';

  constructor(width: number, height: number, color: string) {
    this.reset(width, height, color);
  }

  reset(width: number, height: number, color: string) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    // Velocity (speed and direction)
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.size = Math.random() * 3 + 1; // Size between 1px and 4px
    this.color = color;
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}


export const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useTheme();

  // Pull theme colors (e.g., primary main, or fallback to blue)
  const particleColor = theme.primary.main;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 60; // Adjust for density

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

      // Re-initialize particles on resize to fit new dimensions
      particles = Array.from(
        { length: particleCount },
        () => new Particle(canvas.width, canvas.height, particleColor),
      );
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3. The Core Animation Loop
    const render = () => {
      // Clear the canvas on every frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and Draw Particles
      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);
      });

      // Optional: Draw connecting lines (constellation effect)
      drawLines(ctx, particles);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleColor]); // Re-run effect if theme color changes

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none', // Ensures canvas doesn't block clicks to UI elements
      }}
    />
  );
};

// 4. Helper function to draw web lines between close particles
function drawLines(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  const maxDistance = 100;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        // Fade line opacity out as distance increases
        const opacity = 1 - distance / maxDistance;
        ctx.strokeStyle = `rgba(150, 150, 150, ${opacity * 0.2})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

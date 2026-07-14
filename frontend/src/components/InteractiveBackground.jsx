import { useEffect, useRef } from "react";
import { useThemeStore } from "../store/useThemeStore";

const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Get colors dynamically based on CSS theme variables
    const getColors = () => {
      const style = getComputedStyle(document.documentElement);
      const pVal = style.getPropertyValue("--p").trim();
      const sVal = style.getPropertyValue("--s").trim();
      
      // Extract numbers or use default fallback
      const primary = pVal ? `oklch(${pVal})` : "oklch(0.62 0.24 280)";
      const secondary = sVal ? `oklch(${sVal})` : "oklch(0.64 0.26 330)";
      
      return { primary, secondary };
    };

    let colors = getColors();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    const particles = [];
    const particleCount = Math.min(30, Math.floor((width * height) / 50000));

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.8 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.14;
        this.vy = (Math.random() - 0.5) * 0.14;
        this.alpha = Math.random() * 0.2 + 0.08;
        this.colorType = Math.random() > 0.5 ? "primary" : "secondary";
      }

      update(mouseX, mouseY) {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse hover interaction (push particles away gently)
        if (mouseX !== undefined && mouseY !== undefined) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            // Drifts particles away from cursor
            this.x -= (dx / dist) * force * 0.45;
            this.y -= (dy / dist) * force * 0.45;
          }
        }

        // Boundary warp
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = this.colorType === "primary" ? colors.primary : colors.secondary;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    let mouseX;
    let mouseY;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = undefined;
      mouseY = undefined;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouseX, mouseY);
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = (110 - dist) / 110 * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].colorType === "primary" ? colors.primary : colors.secondary;
            ctx.globalAlpha = alpha;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-25"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default InteractiveBackground;

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_URL } from "@/constant/static";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const COLORS = [
  "#705BE4",
  "#34C759",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
];

type Particle = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
};

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const canvas = document.createElement("canvas");

    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";

    document.body.appendChild(canvas);

    const context = canvas.getContext("2d");

    if (!context) {
      canvas.remove();
      return;
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    const particles: Particle[] = [];

    /*
     * Confetti starts from the top of the screen
     * and falls down naturally.
     */
    for (let i = 0; i < 70; i++) {
      particles.push({
        // Spread particles across the complete width
        x: Math.random() * window.innerWidth,

        // Start slightly above the viewport
        y: -Math.random() * window.innerHeight * 0.6,

        width: Math.random() * 5 + 4,
        height: Math.random() * 8 + 5,

        color: COLORS[Math.floor(Math.random() * COLORS.length)],

        // Small horizontal movement
        velocityX: (Math.random() - 0.5) * 1.5,

        // Downward movement
        velocityY: Math.random() * 2.5 + 1.5,

        rotation: Math.random() * Math.PI * 2,

        rotationSpeed: (Math.random() - 0.5) * 0.08,

        opacity: Math.random() * 0.35 + 0.65,
      });
    }

    let animationFrameId = 0;
    let startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Move particle
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        // Slight gravity effect
        particle.velocityY += 0.015;

        // Rotate confetti
        particle.rotation += particle.rotationSpeed;

        /*
         * Fade out near the end of the animation.
         */
        const fadeStart = 3000;
        const fadeDuration = 1200;

        let opacity = particle.opacity;

        if (elapsed > fadeStart) {
          opacity =
            particle.opacity -
            ((elapsed - fadeStart) / fadeDuration) * particle.opacity;
        }

        opacity = Math.max(0, opacity);

        context.save();

        context.globalAlpha = opacity;

        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);

        context.fillStyle = particle.color;

        context.fillRect(
          -particle.width / 2,
          -particle.height / 2,
          particle.width,
          particle.height
        );

        context.restore();
      });

      /*
       * Continue animation for approximately 4.2 seconds.
       */
      if (elapsed < 4200) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.remove();
    };
  }, []);

  const handleContinue = () => {
    router.push(APP_URL.LINKS.CURRENT_PLAN);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card
        className="
          w-full
          max-w-sm
          rounded-3xl
          border
          border-border/60
          bg-card
          px-7
          py-8
          text-center
          shadow-lg
          shadow-black/5
          animate-in
          fade-in
          zoom-in-95
          duration-500
        "
      >
        {/* Success Icon */}
        <div
          className="
            relative
            mx-auto
            mb-6
            flex
            h-20
            w-20
            items-center
            justify-center
            animate-in
            zoom-in
            duration-700
          "
        >
          {/* Soft outer glow */}
          <div
            className="
              absolute
              inset-0
              rounded-full
              bg-green-500/10
              animate-pulse
            "
          />

          {/* Success circle */}
          <div
            className="
              relative
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-green-500
              text-white
              shadow-lg
              shadow-green-500/20
              animate-in
              zoom-in
              duration-500
            "
          >
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
        </div>

        {/* Content */}
        <div
          className="
            animate-in
            fade-in
            slide-in-from-bottom-2
            duration-700
          "
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payment Successful!
          </h1>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Your subscription has been activated successfully. You now have
            access to all Premium features.
          </p>
        </div>

        {/* Active Status */}
        <div
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-green-50
            px-4
            py-3
            dark:bg-green-500/10
            animate-in
            fade-in
            duration-700
          "
        >
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />

          <span className="text-xs font-medium text-green-700 dark:text-green-400">
            Premium subscription is active
          </span>
        </div>

        {/* CTA */}
        <Button
          type="button"
          onClick={handleContinue}
          className="
            mt-5
            w-full
            rounded-xl
            bg-primary
            py-6
            font-semibold
            text-primary-foreground
            shadow-md
            shadow-primary/20
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-primary/90
            hover:shadow-lg
            active:translate-y-0
          "
        >
          Go to My Plan
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          Thank you for choosing UnionAI
        </p>
      </Card>
    </main>
  );
}
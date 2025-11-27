'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

export default function KarriereadlerStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Mobile: Animation peaks earlier (at ~25–45% instead of 50%) and stays longer
  // Desktop: Animation peaks at center (50%)
  const mobileKeyframes = [0, 0.25, 0.45, 1];
  const desktopKeyframes = [0, 0.5, 1];

  const opacityInput = isMobile ? mobileKeyframes : desktopKeyframes;
  const opacityOutput = isMobile ? [0, 1, 1, 0] : [0, 1, 0];

  const opacity = useTransform(scrollYProgress, opacityInput, opacityOutput);
  const scale = useTransform(scrollYProgress, opacityInput, isMobile ? [0.4, 1.0, 1.0, 0.4] : [0.4, 1.0, 0.4]);
  const rotateX = useTransform(scrollYProgress, opacityInput, isMobile ? [45, 0, 0, -45] : [45, 0, -45]);
  const rotateY = useTransform(scrollYProgress, opacityInput, isMobile ? [-15, 0, 0, 15] : [-15, 0, 15]);
  const y = useTransform(scrollYProgress, opacityInput, isMobile ? [150, 0, 0, -150] : [150, 0, -150]);
  const blur = useTransform(scrollYProgress, opacityInput, isMobile ? [
    'blur(6px)',
    'blur(0px)',
    'blur(0px)',
    'blur(6px)'
  ] : [
    'blur(8px)',
    'blur(0px)',
    'blur(8px)'
  ]);

  return (
    <motion.section
      ref={sectionRef}
      className="bg-white w-full overflow-hidden relative"
      style={{ perspective: '800px' }}
    >
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{
            opacity,
            scale,
            rotateX,
            rotateY,
            y,
            filter: blur,
            transformStyle: 'preserve-3d',
            willChange: 'transform, opacity, filter'
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
        >
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Die Geschichte vom Karriereadler
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                Der Karriereadler steht für Scharfblick statt Blindflug.
              </p>
              <p>
                Er kennt das Terrain genau: Vom gläsernen Konzern-Tower bis zum Start-up im Hinterhof weiß er, was Personaler wirklich sehen wollen. Dieses Wissen ist dein Vorteil.
              </p>
              <p>
                Wir nehmen deine Rohdaten und bisherigen Unterlagen und verwandeln sie in Bewerbungen, die Türen öffnen. Klar strukturiert, professionell formuliert und präzise auf die Stelle zugeschnitten. Keine leeren Worthülsen. Du lieferst die Fakten – der Karriereadler verleiht ihnen die nötige Flughöhe, damit deine Bewerbung dort landet, wo sie hingehört: ganz oben auf dem Stapel.
              </p>
            </div>
          </div>

          <div className="relative aspect-square max-w-sm mx-auto w-full">
            <div className="absolute inset-0 rounded-3xl bg-orange-50/80 border border-orange-100 shadow-sm" />
            <div className="absolute inset-3 rounded-2xl overflow-hidden">
              <Image
                src="/uploads/photos/karriereadler_story.jpg"
                alt="Illustration des Karriereadlers"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 60vw, 90vw"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';
import BookingCalendar from '../components/BookingCalendar';
import ImageGallery from '../components/ImageGallery';
import ContactForm from '../components/ContactForm';

export default function HomePage() {
  // Double-buffered videos to avoid compositing gaps on iOS/Safari
  const vA = useRef<HTMLVideoElement | null>(null);
  const vB = useRef<HTMLVideoElement | null>(null);

  // --- Autoplay + double-buffer swap without black flicker ---
  useEffect(() => {
    const a = vA.current;
    const b = vB.current;
    if (!a || !b) return;

    const HEAD = 0.05;           // skip potential dark head frame
    const SWITCH_EARLY = 0.18;   // seconds before end to swap

    // Ensure both videos are GPU-promoted and ready
    const prep = (v: HTMLVideoElement) => {
      v.muted = true;
      (v as any).playsInline = true;
      v.preload = 'auto';
      v.loop = false;
      v.currentTime = HEAD;
      v.style.willChange = 'opacity';
      v.style.backfaceVisibility = 'hidden';
      v.style.transform = 'translateZ(0)';
      v.play().catch(() => {});
    };

    // Strongly type the pair to avoid TS inferring never
    const both: [HTMLVideoElement, HTMLVideoElement] = [a, b];
    both.forEach(prep);

    // Gesture fallback if autoplay blocked
    const kick = () => {
      both.forEach(v => v.play().catch(() => {}));
      window.removeEventListener('touchstart', kick);
      window.removeEventListener('click', kick);
    };
    window.addEventListener('touchstart', kick, { passive: true });
    window.addEventListener('click', kick);

    // Wait until the next *painted* video frame is available
    const nextPaintedFrame = (video: HTMLVideoElement) =>
      new Promise<void>((resolve) => {
        const anyVid = video as HTMLVideoElement & {
          requestVideoFrameCallback?: (cb: () => void) => number;
        };
        if (typeof anyVid.requestVideoFrameCallback === 'function') {
          anyVid.requestVideoFrameCallback(() => resolve());
        } else {
          const once = () => resolve();
          video.addEventListener('timeupdate', once, { once: true });
        }
      });

    // Help the compositor settle before flipping opacity
    const twoRAFs = () =>
      new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    let active: HTMLVideoElement = a;
    let idle: HTMLVideoElement = b;
    let raf = 0;
    let swapping = false;

    const prepareAndSwap = async () => {
      if (swapping) return;
      swapping = true;

      // Prime the idle video so it has a decoded frame ready
      try {
        idle.currentTime = HEAD;
        await idle.play().catch(() => {});
        await nextPaintedFrame(idle);
      } catch {
        // ignore
      }

      // Show the new layer first, then hide the old one on the next paint
      idle.style.opacity = '1';
      await twoRAFs();
      active.style.opacity = '0';

      // Pause the hidden one slightly later to save power
      setTimeout(() => {
        if (!active.paused && active.style.opacity === '0') active.pause();
      }, 180);

      // Swap references
      const tmp = active;
      active = idle;
      idle = tmp;
      swapping = false;
    };

    const step = () => {
      if (active.duration && active.currentTime >= active.duration - SWITCH_EARLY) {
        void prepareAndSwap();
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('touchstart', kick);
      window.removeEventListener('click', kick);
    };
  }, []);

  // --- Hero text animation (Anime.js v4) ---
  useEffect(() => {
    const h = document.querySelector('.ml5');
    if (!h) return;

    const tl = createTimeline({
      loop: true,
      autoplay: false,
      defaults: { duration: 700, easing: 'easeInOutExpo' },
    });

    tl.add('.ml5 .line', { opacity: [0.5, 1], scaleX: [0, 1] })
      .add('.ml5 .line1', { translateY: '-0.625em', duration: 600, easing: 'easeOutExpo' })
      .add('.ml5 .line2', { translateY: '0.625em', duration: 600, easing: 'easeOutExpo' }, '<')
      .add('.ml5 .ampersand', { opacity: [0, 1], scaleY: [0.5, 1], duration: 600, easing: 'easeOutExpo' })
      .add('.ml5 .letters-left', { opacity: [0, 1], translateX: ['0.5em', 0], duration: 600, easing: 'easeOutExpo' }, '-0.3')
      .add('.ml5 .letters-right', { opacity: [0, 1], translateX: ['-0.5em', 0], duration: 600, easing: 'easeOutExpo' }, '-0.6')
      .add('.ml5', { opacity: [1, 0], duration: 1000, easing: 'easeOutExpo' })
      .add({}, { duration: 1000 });

    tl.init();

    // Native smooth scroll for same-page anchors
    const onClick = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement | null;
      const id = a?.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      e.preventDefault();
      const el = document.querySelector(id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const links = document.querySelectorAll('a[href^="#"]') as NodeListOf<HTMLAnchorElement>;
    links.forEach((l) => l.addEventListener('click', onClick));
    return () => links.forEach((l) => l.removeEventListener('click', onClick));
  }, []);

  const year = new Date().getFullYear();

  return (
    <>
      <main>
        {/* Hero */}
        <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[#0b1220]">
          {/* Fallback still under the videos to mask any rare gaps */}
          <img
            src="/hero-frame.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />

          {/* Background videos (double-buffered, cross-fade) */}
          <video
            ref={vA}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: 1, willChange: 'opacity', transform: 'translateZ(0)', backfaceVisibility: 'hidden' as any }}
            src="/hero-video.mp4"
            muted
            playsInline
            preload="auto"
            autoPlay
          />
          <video
            ref={vB}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: 0, willChange: 'opacity', transform: 'translateZ(0)', backfaceVisibility: 'hidden' as any }}
            src="/hero-video.mp4"
            muted
            playsInline
            preload="auto"
            autoPlay
          />

          {/* Warm overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#D96D47]/70 via-[#F7B801]/40 to-transparent pointer-events-none" />

          {/* Hero copy */}
          <div className="relative z-20 text-center text-white p-4 flex flex-col items-center">
            <h1 className="ml5 text-4xl md:text-5xl font-light">
              <span className="text-wrapper inline-block relative pt-[0.1em] pr-[0.05em] pb-[0.15em] leading-[1em]">
                <span className="line line1 absolute left-0 top-0 bottom-0 m-auto h-[3px] w-full bg-white/90 origin-[50%_0] opacity-50" />
                <span className="letters letters-left inline-block opacity-0">
                  Sunlit&nbsp;Days
                </span>
                <span className="letters ampersand inline-block font-serif italic font-normal mx-[-0.1em] w-[1em] opacity-0">
                  &amp;
                </span>
                <span className="letters letters-right inline-block opacity-0">
                  Azure&nbsp;Bays
                </span>
                <span className="line line2 absolute left-0 top-0 bottom-0 m-auto h-[3px] w-full bg-white/90 origin-[50%_0] opacity-50" />
              </span>
            </h1>
            <p className="mt-3 text-white/95">
              Your Les Issambres escape awaits.
            </p>
            <a
              href="#gallery"
              className="mt-8 font-bold py-3 px-6 rounded-xl bg-white text-[#1F2A44]
                         hover:bg-[#F7B801] hover:text-[#1F2A44]
                         transition-colors duration-300 shadow-md"
            >
              Explore Photos
            </a>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="py-20 bg-[#F9EBD8]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-2 font-lato text-[#1F2A44]">Gallery</h2>
            <p className="text-[#3A8FB7] mb-12">A glimpse of your home away from home.</p>
            <ImageGallery />
          </div>
        </section>

        {/* Calendar */}
        <section id="calendar" className="py-20 bg-[#E9E1F5]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-2 text-[#D96D47]">Availability</h2>
            <p className="text-[#1F2A44] mb-12">Find the perfect dates for your stay.</p>
            <div className="flex justify-center"><BookingCalendar /></div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 text-white bg-[#3A8FB7]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-2">Get in Touch</h2>
            <p className="text-white/90 mb-12">We&apos;d love to hear from you. Send us a message!</p>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="bg-[#1F2A44] text-white text-center p-4">
        <p>© {year} Familien Simonsen/Ulrich. All Rights Reserved.</p>
      </footer>
    </>
  );
}

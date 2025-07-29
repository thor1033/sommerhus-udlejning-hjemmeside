'use client';

import { useState, useRef, useEffect } from 'react';
import { animate, createTimeline, stagger, text } from 'animejs'; 
import BookingCalendar from '../components/BookingCalendar';
import ImageGallery from '../components/ImageGallery';
import ContactForm from '../components/ContactForm';

const FADE_TIME = 0.5;

export default function HomePage() {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState(1);

  // Video loop logic (remains the same)
  useEffect(() => {
    const video1 = videoRef1.current;
    const video2 = videoRef2.current;
    if (!video1 || !video2) return;
    video1.style.opacity = '1';
    video2.style.opacity = '0';
    video1.play();
    video2.play();
    const interval = setInterval(() => {
      const videoToPlay = activeVideo === 1 ? video1 : video2;
      const videoToFadeIn = activeVideo === 1 ? video2 : video1;
      if (videoToPlay.currentTime >= videoToPlay.duration - FADE_TIME) {
        videoToFadeIn.style.opacity = '1';
        videoToPlay.style.opacity = '0';
        videoToPlay.currentTime = 0;
        setActiveVideo(prev => (prev === 1 ? 2 : 1));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activeVideo]);

  // --- Animation Logic ---
  useEffect(() => {
    // Smooth scrolling for navigation links
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        if (targetId) {
          animate( 'html, body',{
            scrollTop: document.querySelector(targetId)!.getBoundingClientRect().top + window.scrollY,
            duration: 1000,
            easing: 'easeInOutQuad'
          });
        }
      });
    });

    if (!document.querySelector('.fancy-text')) return;

    const { words, chars } = text.split('.fancy-text', {
      words: { wrap: 'clip' },
      chars: true,
    });
    
    createTimeline({
      loop: true,
      // Ease function for cubic bezier: "in-out-quint"
      defaults: {ease: 'inOut(3)', duration: 650 }
    })
.add(words, {
  y: [$el => +$el.dataset.line % 2 ? '100%' : '-100%', '0%'],
}, stagger(125))
.add(chars, {
  y: [$el => +$el.dataset.line % 2 ? '100%' : '-100%'],
}, stagger(10, { from: 'random' }))
    .init();

  }, []); // Run animations once on mount

  return (
    <>

      <main>
        {/* Hero Section */}
        <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full z-0">
            <video ref={videoRef1} muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000"><source src="/hero-video.mp4" type="video/mp4" /></video>
            <video ref={videoRef2} muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000"><source src="/hero-video.mp4" type="video/mp4" /></video>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10" />
          
          <div className="relative z-20 text-center text-white p-4 flex flex-col items-center">
            {/* --- 3. THE NEW TEXT ELEMENT TO BE ANIMATED --- */}
            <p className="fancy-text text-4xl md:text-5xl font-bold leading-tight">
              Discover. Unwind. Connect.
            </p>
            
            <a href="#gallery" className="bg-white text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition duration-300 mt-10">
              Explore Photos
            </a>
          </div>
        </section>

        {/* Other sections... */}
        <section id="gallery" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-2 font-lato text-black">Gallery</h2>
            <p className="text-gray-600 mb-12">A glimpse of your home away from home.</p>
            <ImageGallery />
          </div>
        </section>
        <section id="calendar" className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-2">Availability</h2>
            <p className="text-gray-600 mb-12">Find the perfect dates for your stay.</p>
            <div className="flex justify-center"><BookingCalendar /></div>
          </div>
        </section>
        <section id="contact" className="py-20 bg-gray-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-2">Get in Touch</h2>
            <p className="text-gray-300 mb-12">We&apos;d love to hear from you. Send us a message!</p>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white text-center p-4">
        <p>© {new Date().getFullYear()} Sommerhus Frankrig. All Rights Reserved.</p>
      </footer>
    </>
  );
}

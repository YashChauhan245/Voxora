import { Link } from "react-router";
import { useRef, useEffect, useState, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  MessageSquareIcon,
  VideoIcon,
  BrainCircuitIcon,
  MicIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeIcon,
  ShieldCheckIcon,
  HeadphonesIcon,
} from "lucide-react";
import BrandMark from "../components/BrandMark";
import InteractiveBackground from "../components/InteractiveBackground";

/* ───── Scroll-reveal ───── */
const Reveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35, scale: 0.985, rotateX: 2 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "bottom center" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ───── 3D Mouse Tilt Card ───── */
const TiltCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Rotate max 5.5 degrees for premium feel
    const rX = -(mouseY / (height / 2)) * 5.5;
    const rY = (mouseX / (width / 2)) * 5.5;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      style={{ transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ───── Typing animation hook ───── */
const useTyping = (text, speed = 40, startDelay = 800) => {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timeout);
  }, [startDelay]);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, started]);
  return { display, done, started };
};

/* ───── Animated counter ───── */
const Counter = ({ target, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

/* ───── Rotating words in hero ───── */
const ROTATING_WORDS = ["Japanese", "Spanish", "French", "Korean", "German", "Italian", "Portuguese", "Arabic"];
const RotatingWord = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex(i => (i + 1) % ROTATING_WORDS.length), 2400);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="inline-block relative w-[280px] sm:w-[350px] md:w-[480px] h-[1.15em] align-bottom overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 gradient-text"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

/* ───── Infinite Language Marquee ───── */
const Marquee = () => {
  const items = [
    "🇯🇵 Japanese", "🇪🇸 Spanish", "🇫🇷 French", "🇰🇷 Korean", "🇩🇪 German", "🇮🇹 Italian", 
    "🇵🇹 Portuguese", "🇨🇳 Chinese", "🇷🇺 Russian", "🇺🇸 English", "🇸🇦 Arabic", "🇮🇳 Hindi"
  ];
  // Duplicate items for continuous scroll loop
  const duplicatedItems = [...items, ...items, ...items];
  
  return (
    <div className="w-full overflow-hidden py-5 border-y border-primary/5 bg-base-200/10 relative z-10 my-12">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-base-100 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-base-100 to-transparent z-20 pointer-events-none" />
      <motion.div 
        className="flex gap-10 whitespace-nowrap w-max"
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30,
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <span 
            key={idx} 
            className="text-sm font-semibold text-base-content/25 hover:text-primary transition-colors cursor-default"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */
const LandingPage = () => {
  const heroRef = useRef(null);
  
  // Track scroll position for animations
  const { scrollY } = useScroll();
  const { scrollYProgress: pageScrollYProgress } = useScroll();
  
  const { scrollYProgress: heroScrollYProgress } = useScroll({ 
    target: heroRef, 
    offset: ["start start", "end start"] 
  });
  
  // Parallax layers for decorative blobs
  const blobY1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const blobY2 = useTransform(scrollY, [0, 1500], [0, 200]);
  
  // Hero section scroll transforms
  const heroScale = useTransform(heroScrollYProgress, [0, 1], [1, 0.95]);
  const heroOpacity = useTransform(heroScrollYProgress, [0, 0.7], [1, 0]);
  const heroParallax = useTransform(heroScrollYProgress, [0, 1], [0, -40]);

  const { display: typedMsg, done: typingDone, started: typingStarted } = useTyping(
    "お忙しいところ恐れ入りますが、少々お時間をいただけますか？",
    35,
    1200
  );

  /* Cursor blink for chat input */
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    const blink = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <div className="relative min-h-screen bg-base-100 overflow-x-hidden">
      <InteractiveBackground />

      {/* Premium Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary via-accent to-secondary z-[60] origin-left"
        style={{ scaleX: pageScrollYProgress }}
      />

      {/* Floating Parallax Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          style={{ y: blobY1 }}
          className="absolute top-[18%] left-[8%] w-80 h-80 rounded-full blur-[140px] opacity-[0.06] bg-primary"
        />
        <motion.div 
          style={{ y: blobY2 }}
          className="absolute top-[45%] right-[5%] w-96 h-96 rounded-full blur-[160px] opacity-[0.05] bg-secondary"
        />
      </div>

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14">
        <div className="absolute inset-0 bg-base-200/70 backdrop-blur-2xl border-b border-primary/10" />
        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="size-7" />
            <span className="text-lg font-bold tracking-tight gradient-text font-display">Voxora</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-base-content/40">
            <a href="#features" className="hover:text-base-content transition-colors duration-200">Features</a>
            <a href="#product" className="hover:text-base-content transition-colors duration-200">Product</a>
            <a href="#ai" className="hover:text-base-content transition-colors duration-200">AI Tutor</a>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/login" className="btn btn-ghost btn-sm text-sm text-base-content/50">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm text-sm">
              Get started <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ╔══════════════════════════════════════╗
         ║               HERO                   ║
         ╚══════════════════════════════════════╝ */}
      <section ref={heroRef} className="relative pt-32 sm:pt-40 pb-4 px-5 sm:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none" style={{
          background: "radial-gradient(ellipse at center, oklch(var(--p) / 0.06) 0%, transparent 70%)",
        }} />

        <motion.div style={{ y: heroParallax, scale: heroScale, opacity: heroOpacity }} className="relative max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold tracking-[-0.04em] leading-[1.08] text-base-content mb-6"
          >
            Learn <RotatingWord />
            <br />
            by actually speaking it.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base sm:text-lg text-base-content/40 max-w-xl mx-auto leading-relaxed mb-10"
          >
            Real-time chat, video calls, and voice notes with native speakers —
            powered by an AI tutor that coaches you in every conversation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link to="/signup" className="btn btn-primary h-12 px-8 text-[15px] font-semibold shadow-glow">
              Start learning for free
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link to="/login" className="btn btn-outline h-12 px-8 text-[15px]">
              I have an account
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Marquee />

      {/* ╔══════════════════════════════════════╗
         ║        PRODUCT PREVIEW               ║
         ╚══════════════════════════════════════╝ */}
      <section id="product" className="relative px-5 sm:px-8 pt-16 pb-28 sm:pb-36">
        <Reveal>
          <div className="max-w-5xl mx-auto">
            {/* The app mockup — with a gentle classic float bobbing animation */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative rounded-2xl border border-primary/15 bg-base-200/60 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-primary/8 bg-base-200/80">
                <span className="w-3 h-3 rounded-full bg-error/40" />
                <span className="w-3 h-3 rounded-full bg-warning/40" />
                <span className="w-3 h-3 rounded-full bg-success/40" />
                <div className="ml-3 flex-1 max-w-xs h-[26px] rounded-lg bg-base-100/40 border border-primary/8 flex items-center justify-center">
                  <span className="text-[10px] text-base-content/20 font-mono tracking-wide">voxora.app/chat/yuki</span>
                </div>
              </div>

              {/* Two-pane layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
                {/* Sidebar */}
                <div className="hidden lg:flex flex-col border-r border-primary/8 bg-base-200/40">
                  <div className="p-4 border-b border-primary/8">
                    <div className="input flex items-center gap-2 h-9 text-xs bg-base-100/30 border-primary/10">
                      <span className="text-base-content/20">Search conversations...</span>
                    </div>
                  </div>
                  <div className="p-2 flex-1 space-y-0.5">
                    {[
                      { name: "Yuki Tanaka", flag: "🇯🇵", msg: "That keigo was perfect!", time: "now", active: true, online: true },
                      { name: "Carlos Reyes", flag: "🇲🇽", msg: "¿Practicamos mañana?", time: "15m", active: false, online: true },
                      { name: "Amélie Durand", flag: "🇫🇷", msg: "Voice note · 0:12", time: "2h", active: false, online: false },
                      { name: "Luca Bianchi", flag: "🇮🇹", msg: "Grazie mille! A dopo 👋", time: "5h", active: false, online: false },
                      { name: "Min-ji Park", flag: "🇰🇷", msg: "감사합니다! See you Sat", time: "1d", active: false, online: true },
                    ].map((c) => (
                      <div
                        key={c.name}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                          c.active
                            ? "bg-primary/[0.1] border border-primary/20"
                            : "hover:bg-base-content/[0.03] border border-transparent"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-base-300/60 flex items-center justify-center text-sm ring-1 ring-primary/10">
                            {c.flag}
                          </div>
                          {c.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-base-200" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[12.5px] font-semibold truncate ${c.active ? "text-base-content" : "text-base-content/60"}`}>{c.name}</span>
                            <span className="text-[10px] text-base-content/20 shrink-0 ml-2">{c.time}</span>
                          </div>
                          <p className="text-[11px] text-base-content/25 truncate mt-0.5">{c.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat pane */}
                <div className="flex flex-col bg-base-100/20">
                  {/* Chat header */}
                  <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-primary/8 bg-base-200/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-base-300/60 flex items-center justify-center text-sm ring-2 ring-primary/15">🇯🇵</div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-base-200" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-base-content">Yuki Tanaka</div>
                        <div className="text-[10.5px] text-base-content/30">Native Japanese · Learning English · Tokyo</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="w-8 h-8 rounded-lg bg-base-content/[0.04] hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200 text-base-content/30">
                        <VideoIcon className="size-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-base-content/[0.04] hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200 text-base-content/30">
                        <HeadphonesIcon className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 px-5 sm:px-6 py-5 space-y-4 min-h-[340px] sm:min-h-[380px]">
                    {/* Date divider */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-primary/6" />
                      <span className="text-[10px] text-base-content/15 font-medium uppercase tracking-wider">Today</span>
                      <div className="flex-1 h-px bg-primary/6" />
                    </div>

                    {/* Received message */}
                    <div className="flex gap-2.5 max-w-[80%]">
                      <div className="w-7 h-7 rounded-full bg-base-300/40 flex items-center justify-center text-[11px] shrink-0 mt-1 ring-1 ring-primary/8">🇯🇵</div>
                      <div>
                        <div className="px-4 py-2.5 rounded-2xl rounded-tl-md bg-base-200/80 border border-primary/10 text-[13px] text-base-content/70 leading-relaxed">
                          こんにちは！Let's practice keigo today — try asking me
                          for some time politely 😊
                        </div>
                        <span className="text-[10px] text-base-content/15 mt-1 ml-1 block">2:34 PM</span>
                      </div>
                    </div>

                    {/* Sent message — with typing effect */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%]">
                        <div className="px-4 py-2.5 rounded-2xl rounded-tr-md text-[13px] text-white leading-relaxed"
                          style={{ background: "linear-gradient(135deg, oklch(var(--p)), oklch(var(--s) / 0.8))" }}>
                          {typingStarted ? typedMsg : ""}
                          {typingStarted && !typingDone && (
                            <span className={`inline-block w-[2px] h-[13px] bg-white/70 ml-0.5 align-middle ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
                          )}
                          {!typingStarted && (
                            <span className="flex items-center gap-1 text-white/40 text-[12px]">
                              <span className="inline-flex gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1 h-1 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1 h-1 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                              </span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-base-content/15 mt-1 mr-1 block text-right">2:35 PM</span>
                      </div>
                    </div>

                    {/* AI feedback — fades in after typing completes */}
                    <AnimatePresence>
                      {typingDone && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.45, delay: 0.4, ease: "easeOut" }}
                          className="max-w-[85%]"
                        >
                          <div className="px-4 py-3.5 rounded-xl bg-primary/[0.06] border border-primary/15 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
                                <SparklesIcon className="size-3 text-primary" />
                              </div>
                              <span className="text-[11px] font-semibold text-primary/70">AI Language Coach</span>
                            </div>
                            <p className="text-[12.5px] text-base-content/50 leading-relaxed">
                              <span className="text-base-content/70 font-medium">Excellent keigo.</span> 「お忙しいところ恐れ入りますが」 is a very natural
                              and polite way to preface a request in business Japanese. Your particle
                              usage and verb conjugation are both correct.
                            </p>
                            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-primary/8">
                              <span className="text-[10px] text-primary/50 font-medium cursor-pointer hover:text-primary/80 transition-colors">Explain grammar</span>
                              <span className="text-[10px] text-primary/50 font-medium cursor-pointer hover:text-primary/80 transition-colors">Casual version</span>
                              <span className="text-[10px] text-primary/50 font-medium cursor-pointer hover:text-primary/80 transition-colors">More practice</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Input dock */}
                  <div className="flex items-center gap-2 px-5 sm:px-6 py-3 border-t border-primary/8 bg-base-200/40">
                    <button className="w-9 h-9 rounded-xl bg-base-content/[0.03] hover:bg-primary/10 flex items-center justify-center text-base-content/20 hover:text-primary transition-all shrink-0">
                      <MicIcon className="size-4" />
                    </button>
                    <div className="flex-1 h-10 rounded-xl bg-base-100/40 border border-primary/10 flex items-center px-4">
                      <span className="text-[12.5px] text-base-content/20">Message Yuki...</span>
                    </div>
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                      style={{ background: "linear-gradient(135deg, oklch(var(--p)), oklch(var(--s)))" }}>
                      <ArrowRightIcon className="size-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Glow under mockup */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-24 rounded-full blur-[60px] opacity-[0.08] pointer-events-none"
              style={{ background: "linear-gradient(90deg, oklch(var(--p)), oklch(var(--s)))" }} />
          </div>
        </Reveal>
      </section>

      {/* ╔══════════════════════════════════════╗
         ║          BENTO FEATURES              ║
         ╚══════════════════════════════════════╝ */}
      <section id="features" className="relative px-5 sm:px-8 pb-28 sm:pb-36">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-base-content mb-3">
                Everything for real practice.
              </h2>
              <p className="text-sm sm:text-base text-base-content/35 max-w-lg leading-relaxed">
                Not flashcards. Not quizzes. Tools built for people who want to have
                real conversations in their target language.
              </p>
            </div>
          </Reveal>

          {/* Bento grid — mixed sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" style={{ perspective: "1000px" }}>
            {/* Card 1 — Real-time chat (tall) */}
            <Reveal className="sm:row-span-2">
              <TiltCard className="h-full group rounded-2xl bg-base-200/50 border border-primary/12 p-6 sm:p-7 hover:border-primary/25 transition-all duration-300 hover:shadow-glow-sm overflow-hidden relative flex flex-col">
                <MessageSquareIcon className="size-5 text-primary/60 mb-4" />
                <h3 className="text-lg font-bold text-base-content tracking-tight mb-2">Real-time messaging</h3>
                <p className="text-[13px] text-base-content/35 leading-relaxed mb-6">
                  WebSocket-powered chat with read receipts, typing indicators, and rich media.
                  Send text, images, and voice notes to your language partners instantly.
                </p>
                {/* Mini chat preview inside the card */}
                <div className="space-y-2.5 mt-auto">
                  <div className="flex justify-start">
                    <div className="px-3 py-1.5 rounded-xl rounded-bl-sm bg-base-300/50 text-[11px] text-base-content/50 border border-primary/5 max-w-[85%]">
                      Oui, je suis allé au marché ce matin 🥐
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="px-3 py-1.5 rounded-xl rounded-br-sm text-[11px] text-white/80 max-w-[85%]"
                      style={{ background: "linear-gradient(135deg, oklch(var(--p) / 0.75), oklch(var(--s) / 0.6))" }}>
                      Ah génial ! Qu'est-ce que tu as acheté ?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="px-3 py-1.5 rounded-xl rounded-bl-sm bg-base-300/50 text-[11px] text-base-content/50 border border-primary/5 max-w-[85%]">
                      Des croissants et du fromage 😄
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            {/* Card 2 — Video calls */}
            <Reveal delay={0.06}>
              <TiltCard className="group rounded-2xl bg-base-200/50 border border-primary/12 p-6 sm:p-7 hover:border-primary/25 transition-all duration-300 hover:shadow-glow-sm">
                <VideoIcon className="size-5 text-primary/60 mb-4" />
                <h3 className="text-lg font-bold text-base-content tracking-tight mb-2">Video calls</h3>
                <p className="text-[13px] text-base-content/35 leading-relaxed mb-4">
                  Peer-to-peer WebRTC video with conversation templates — practice debates, travel
                  scenarios, or casual chat.
                </p>
                <div className="flex gap-1.5">
                  {["Casual", "Travel", "Debate", "Interview"].map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-base-300/40 border border-primary/8 text-[10px] text-base-content/35 font-medium">{t}</span>
                  ))}
                </div>
              </TiltCard>
            </Reveal>

            {/* Card 3 — Voice notes */}
            <Reveal delay={0.1}>
              <TiltCard className="group rounded-2xl bg-base-200/50 border border-primary/12 p-6 sm:p-7 hover:border-primary/25 transition-all duration-300 hover:shadow-glow-sm">
                <MicIcon className="size-5 text-primary/60 mb-4" />
                <h3 className="text-lg font-bold text-base-content tracking-tight mb-2">Voice notes</h3>
                <p className="text-[13px] text-base-content/35 leading-relaxed mb-4">
                  Record audio directly in chat. AI transcribes it and gives you
                  pronunciation feedback.
                </p>
                {/* Waveform visual */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <div className="w-0 h-0 border-l-[6px] border-l-primary/60 border-y-[4px] border-y-transparent ml-0.5" />
                  </div>
                  <div className="flex gap-[2px] items-center h-6 flex-1">
                    {[4, 8, 14, 6, 12, 16, 8, 10, 14, 4, 8, 12, 6, 10, 16, 8, 4, 12, 8, 6, 14, 10, 4, 8, 12, 6, 10, 8, 4, 6].map((h, i) => (
                      <div key={i} className="w-[2.5px] rounded-full bg-primary/25 transition-all duration-200" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-base-content/20 font-mono shrink-0">0:12</span>
                </div>
              </TiltCard>
            </Reveal>

            {/* Card 4 — AI Tutor (wide) */}
            <Reveal delay={0.14} className="sm:col-span-2">
              <TiltCard className="group rounded-2xl bg-primary/[0.04] border border-primary/15 p-6 sm:p-7 hover:border-primary/25 transition-all duration-300 hover:shadow-glow-sm">
                <div className="flex items-start justify-between mb-4">
                  <BrainCircuitIcon className="size-5 text-primary/60" />
                  <span className="text-[10px] font-semibold text-primary/50 bg-primary/[0.08] px-2.5 py-1 rounded-full">Powered by Gemini</span>
                </div>
                <h3 className="text-lg font-bold text-base-content tracking-tight mb-2">AI language coach, built into every chat</h3>
                <p className="text-[13px] text-base-content/35 leading-relaxed mb-5 max-w-lg">
                  Grammar corrections, tone-aware translations, pronunciation scoring, and conversation
                  starters — all happening inside the conversation, not in a separate tab.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: "Grammar", example: "gefahrt → gefahren", note: "\"Fahren\" uses sein for movement" },
                    { label: "Translation", example: "Could you help me?", note: "手伝っていただけませんか (formal)" },
                    { label: "Pronunciation", example: "Score: 87/100", note: "Work on the French guttural 'r'" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-base-200/60 border border-primary/8 p-3.5">
                      <div className="text-[10px] text-primary/50 uppercase tracking-wider font-semibold mb-1.5">{item.label}</div>
                      <div className="text-[12px] text-base-content/60 font-medium mb-1">{item.example}</div>
                      <div className="text-[11px] text-base-content/25 leading-relaxed">{item.note}</div>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
         ║        AI SECTION — DEEPER LOOK     ║
         ╚══════════════════════════════════════╝ */}
      <section id="ai" className="relative px-5 sm:px-8 pb-28 sm:pb-36">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.08] border border-primary/15 mb-6">
                  <SparklesIcon className="size-3 text-primary/60" />
                  <span className="text-[11px] font-semibold text-primary/60">AI-Powered</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-base-content mb-5 leading-tight">
                  Your tutor is always
                  <br />in the conversation.
                </h2>
                <p className="text-[14px] text-base-content/35 leading-relaxed mb-8 max-w-md">
                  Other apps make you switch between learning and practice. Voxora's AI lives
                  directly inside your chat — it understands context, fixes mistakes as they
                  happen, and helps you sound natural.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: "🎯", title: "Contextual corrections", desc: "Fixes grammar based on what you're actually trying to say" },
                    { icon: "🗣️", title: "Voice analysis", desc: "Transcribes audio and scores pronunciation in real-time" },
                    { icon: "🌐", title: "Tone-aware translation", desc: "Casual, formal, friendly, or academic — you pick" },
                    { icon: "💡", title: "Conversation starters", desc: "Stuck? Get AI-generated icebreakers based on shared interests" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3.5 group">
                      <span className="text-base mt-0.5 shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-[13px] font-semibold text-base-content/75 group-hover:text-base-content transition-colors">{item.title}</div>
                        <div className="text-[12px] text-base-content/30 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <TiltCard className="rounded-2xl bg-base-200/50 border border-primary/12 p-5 sm:p-6 shadow-card">
                {/* A real AI assistant panel mockup */}
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-primary/8">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <SparklesIcon className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-base-content/80">AI Assistant</span>
                  <span className="ml-auto text-[10px] text-green-400/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" /> Active
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Translation card */}
                  <div className="rounded-xl bg-base-100/30 border border-primary/8 p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-primary/50 uppercase tracking-wider font-semibold">Translation · Formal</span>
                      <span className="text-[9px] text-base-content/15">Just now</span>
                    </div>
                    <div className="text-[12.5px] text-base-content/35 mb-1">Could you schedule a meeting for next week?</div>
                    <div className="text-[13px] text-base-content/70 font-medium">来週の会議をご予定いただけますでしょうか？</div>
                  </div>

                  {/* Grammar card */}
                  <div className="rounded-xl bg-base-100/30 border border-primary/8 p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-primary/50 uppercase tracking-wider font-semibold">Grammar fix</span>
                      <span className="text-[9px] text-base-content/15">2m ago</span>
                    </div>
                    <div className="text-[12.5px] text-base-content/35 mb-1">
                      <span className="line-through decoration-error/30">Ich habe nach Berlin gefahrt</span>
                    </div>
                    <div className="text-[13px] text-base-content/70 font-medium">
                      Ich <span className="text-primary">bin</span> nach Berlin <span className="text-primary">gefahren</span>
                    </div>
                    <div className="text-[11px] text-base-content/25 mt-1.5 italic">
                      Movement verbs use "sein" as auxiliary, and the past participle of "fahren" is "gefahren."
                    </div>
                  </div>

                  {/* Pronunciation card */}
                  <div className="rounded-xl bg-base-100/30 border border-primary/8 p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-primary/50 uppercase tracking-wider font-semibold">Pronunciation</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] text-base-content/70 font-medium mb-0.5">Score: 87/100</div>
                        <div className="text-[11px] text-base-content/25">Natural intonation, minor vowel length issue in はい</div>
                      </div>
                      <div className="w-11 h-11 rounded-full border-[3px] border-primary/30 flex items-center justify-center">
                        <span className="text-[11px] font-bold text-primary/70">87</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
         ║            SOCIAL PROOF              ║
         ╚══════════════════════════════════════╝ */}
      <section className="relative px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="rounded-2xl bg-base-200/40 border border-primary/10 p-8 sm:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
                {[
                  { value: 50000, suffix: "+", label: "Learners" },
                  { value: 50, suffix: "+", label: "Languages" },
                  { value: 120, suffix: "+", label: "Countries" },
                  { value: 2, suffix: "M+", label: "Messages exchanged" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                      <Counter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[12px] text-base-content/30 mt-1 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
         ║            BOTTOM CTA               ║
         ╚══════════════════════════════════════╝ */}
      <section className="relative px-5 sm:px-8 pb-32 sm:pb-40">
        {/* Glow */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none"
          style={{ background: "oklch(var(--p))" }} />

        <Reveal>
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-base-content mb-5">
              Ready to start speaking?
            </h2>
            <p className="text-base-content/35 max-w-md mx-auto text-sm sm:text-base mb-10 leading-relaxed">
              Create a free account, pick the language you want to learn, and
              start practicing with native speakers today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/signup" className="btn btn-primary h-12 px-8 text-[15px] font-semibold shadow-glow">
                Create free account
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link to="/login" className="btn btn-ghost text-[15px] text-base-content/45 hover:text-base-content">
                Log in to existing account
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-primary/8 bg-base-200/25 py-8 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandMark className="size-6" />
            <span className="text-sm font-bold text-base-content/35 font-display tracking-tight">Voxora</span>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-base-content/20">
            <a href="#features" className="hover:text-base-content/40 transition-colors">Features</a>
            <span className="hover:text-base-content/40 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-base-content/40 cursor-pointer transition-colors">Terms</span>
            <Link to="/login" className="hover:text-base-content/40 transition-colors">Log in</Link>
          </div>
          <div className="text-[11px] text-base-content/15">
            © {new Date().getFullYear()} Voxora
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Shield, Zap, GraduationCap, CheckCircle2, PlayCircle, Users, Menu, X, TrendingUp, DollarSign, Star, ChevronDown, Rocket, Search, BookOpen } from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

// --- SUB-COMPONENTS ---

const NumberTicker = ({ value }: { value: number }) => {
  return (
    <span className="inline-block font-mono text-orange-400">
      ${value.toLocaleString()}
    </span>
  );
};

const StarField = () => {
  // Generate random stars for background
  const stars = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            opacity: Math.random() * 0.7 + 0.3,
          }}
        />
      ))}
    </div>
  );
};

const MockupCard = ({ title, value, sub, color }: any) => (
  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 w-full mb-3 shadow-lg transform transition-transform hover:scale-105">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-slate-400 font-medium uppercase">{title}</span>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
    </div>
    <div className="text-xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-slate-500">{sub}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, colorClass, delay }: any) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: any) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`group relative border border-white/10 overflow-hidden rounded-3xl p-8 bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-500 h-full flex flex-col`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className={`w-14 h-14 rounded-2xl ${colorClass} bg-opacity-10 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
        <Icon className={`w-7 h-7 ${colorClass.replace('bg-', 'text-').replace('-500', '-400')}`} />
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">{title}</h3>
      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors flex-grow">{desc}</p>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityHero = useTransform(scrollY, [0, 600], [1, 0]);

  // Parallax for 3D mockup
  const rotateX = useTransform(scrollY, [0, 1000], [20, 0]);
  const rotateY = useTransform(scrollY, [0, 1000], [-20, 0]);
  const scaleMockup = useTransform(scrollY, [0, 1000], [1, 1.2]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="min-h-screen bg-deep-space text-white overflow-hidden relative selection:bg-orange-500 selection:text-white font-sans">

      {/* --- GLOBAL BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid">
        <StarField />
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 opacity-20 animate-aurora bg-[size:400%_400%] bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-orange-900/30"></div>

        {/* Floating Orbs - More intense */}
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />

        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* --- NAVBAR --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="fixed top-6 left-0 right-0 z-50 flex items-center justify-center px-4"
      >
        <div className="glass px-6 py-3 rounded-full flex items-center justify-between gap-8 max-w-5xl w-full">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <Logo className="w-8 h-8 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
                    Scholar<span className="text-orange-500">AI</span>
                </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
                {['Features', 'How It Works', 'Stories', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all">{item}</a>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <button
                onClick={onGetStarted}
                className="hidden md:block btn-primary-glow text-sm py-2.5 px-6"
                >
                Sign In
                </button>
                <button className="md:hidden p-2 glass rounded-full hover:bg-white/10 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
      {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl pt-32 px-6 md:hidden flex flex-col items-center gap-8"
          >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-bold text-white hover:text-orange-500 transition-colors">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-bold text-white hover:text-orange-500 transition-colors">How It Works</a>
              <button onClick={onGetStarted} className="w-full max-w-xs btn-primary-glow text-xl">Get Started</button>
              <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 p-2 rounded-full bg-white/10"><X /></button>
          </motion.div>
      )}
      </AnimatePresence>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-40 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 perspective-1000">

        {/* Text Content */}
        <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="flex-1 text-center lg:text-left z-20"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold mb-8 backdrop-blur-md animate-float-fast hover:bg-orange-500/20 transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          >
            <Rocket className="w-3 h-3 text-orange-400" />
            <span className="uppercase tracking-widest">v3.0 Now Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.0] text-white drop-shadow-2xl"
          >
            Free Money <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-glow-strong animate-gradient-x">For College.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light"
          >
            Stop wasting hours on scams. Our <span className="text-white font-semibold">AI Agent</span> scans 10M+ hidden scholarships to match you with funding you'll actually win.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span className="relative z-10">Start Searching</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </motion.button>

            <motion.div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-800 overflow-hidden">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} alt="User" />
                        </div>
                    ))}
                </div>
                <div className="text-left">
                    <div className="flex text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span>Trusted by 50k+ students</span>
                </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 3D Dashboard Mockup */}
        <motion.div
            style={{ rotateX, rotateY, scale: scaleMockup }}
            className="flex-1 w-full max-w-[600px] relative z-10 perspective-1000 hidden lg:block"
        >
            <div className="relative w-full aspect-[4/3] preserve-3d">
                {/* Glow behind */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-500/30 to-purple-600/30 blur-[100px] rounded-full"></div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, rotateX: 20, y: 100 }}
                    animate={{ opacity: 1, rotateX: 10, y: 0 }}
                    transition={{ duration: 1, type: "spring" }}
                    className="absolute inset-0 bg-[#0f0f13]/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-6 flex flex-col gap-4 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">dashboard.scholarai.app</div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl p-4 border border-orange-500/20 flex items-center justify-between">
                             <div>
                                <div className="text-xs text-orange-300 uppercase font-bold mb-1">Total Matched</div>
                                <div className="text-3xl font-bold text-white">$124,500</div>
                             </div>
                             <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                <DollarSign className="w-6 h-6" />
                             </div>
                        </div>
                        <MockupCard title="Application Status" value="5 Pending" sub="2 Accepted" color="bg-blue-500" />
                        <MockupCard title="Deadlines" value="3 This Week" sub="Urgent Action" color="bg-red-500" />
                        <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Sparkles className="w-4 h-4 text-purple-400" /></div>
                                <div className="text-sm font-bold text-white">AI Suggestion</div>
                            </div>
                            <div className="text-xs text-slate-400 leading-relaxed">
                                "Based on your recent essay for the NSF Grant, you are a strong candidate for the STEM Future Leader Award. Apply by Friday to increase odds by 40%."
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-12 top-20 bg-white text-black p-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)] font-bold z-20 w-48"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span>Accepted!</span>
                    </div>
                    <div className="text-xs text-slate-500">NASA STEM Fellowship</div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -left-8 bottom-20 bg-[#1a1a20] border border-white/20 p-4 rounded-xl shadow-2xl z-20 w-48 backdrop-blur-md"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-white font-bold">New Match Found</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 mt-1">98% Match</div>
                </motion.div>
            </div>
        </motion.div>
      </section>

      {/* --- SCROLLING LOGOS --- */}
      <div className="w-full bg-white/5 border-y border-white/5 overflow-hidden py-10 relative z-10">
        <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap gap-24 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {["Harvard", "Stanford", "MIT", "Yale", "NASA", "Google", "Microsoft", "Tesla"].map((brand, i) => (
                <span key={i} className="text-2xl font-bold font-display text-white">{brand}</span>
            ))}
             {["Harvard", "Stanford", "MIT", "Yale", "NASA", "Google", "Microsoft", "Tesla"].map((brand, i) => (
                <span key={`dup-${i}`} className="text-2xl font-bold font-display text-white">{brand}</span>
            ))}
        </div>
      </div>

      {/* --- FEATURES (BENTO GRID) --- */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-block mb-4"
          >
             <span className="py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">Why Us</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-bold mb-6 text-white"
          >
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Unfair Advantage</span>
          </motion.h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">We've automated the entire scholarship lifecycle. What used to take months now takes minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
          {/* Large Card 1 */}
          <div className="col-span-1 md:col-span-2 row-span-2">
             <FeatureCard
                delay={0.1}
                icon={Zap}
                title="AI Auto-Match"
                desc="Stop searching manually. Our Gemini-powered engine scans your unique profile against millions of data points to find opportunities you qualify for instantly. It learns and adapts as you grow."
                colorClass="bg-orange-500"
              />
          </div>
          {/* Small Card 1 */}
          <div className="col-span-1 md:col-span-2 row-span-1">
             <FeatureCard
                delay={0.2}
                icon={BookOpen}
                title="Essay Generator"
                desc="Writer's block is dead. Generate personalized essay outlines and drafts based on specific scholarship prompts in seconds."
                colorClass="bg-purple-500"
              />
          </div>
          {/* Small Card 2 */}
          <div className="col-span-1 md:col-span-1 row-span-1">
             <FeatureCard
                delay={0.3}
                icon={Globe}
                title="Global"
                desc="Access funding from 50+ countries."
                colorClass="bg-blue-500"
              />
          </div>
          {/* Small Card 3 */}
          <div className="col-span-1 md:col-span-1 row-span-1">
             <FeatureCard
                delay={0.4}
                icon={Shield}
                title="Secure"
                desc="Bank-level encryption for your data."
                colorClass="bg-green-500"
              />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (INTERACTIVE) --- */}
      <section id="how-it-works" className="relative z-10 py-32 px-6 bg-white/[0.02]">
         <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                 <div>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">How it works</h2>
                    <p className="text-slate-400 text-lg">Three simple steps to your first scholarship check.</p>
                 </div>
                 <button onClick={onGetStarted} className="px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors font-bold flex items-center gap-2">
                     Start Now <ArrowRight className="w-4 h-4" />
                 </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                 {/* Connecting Line (Desktop) */}
                 <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500/50 via-purple-500/50 to-blue-500/50 z-0"></div>

                 {[
                     { step: "01", title: "Create Profile", desc: "Sync your LinkedIn or upload a resume. Our AI builds your academic profile in seconds." },
                     { step: "02", title: "Get Matches", desc: "Receive a curated list of high-value scholarships where you have the highest probability of winning." },
                     { step: "03", title: "Apply & Win", desc: "Use our AI tools to auto-fill applications and write winning essays. Track everything in one dashboard." }
                 ].map((item, i) => (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="relative z-10 bg-deep-space p-6 border border-white/10 rounded-2xl hover:border-orange-500/50 transition-colors group"
                     >
                         <div className="w-12 h-12 bg-deep-space border-2 border-white/10 text-white font-mono text-xl flex items-center justify-center rounded-full mb-6 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                             {item.step}
                         </div>
                         <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                         <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                     </motion.div>
                 ))}
             </div>
         </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-br from-orange-600 via-red-600 to-purple-700 p-12 md:p-32 text-center relative overflow-hidden shadow-[0_0_100px_rgba(234,88,12,0.4)]"
        >
          {/* Background FX */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)]"></div>

          <div className="relative z-10">
            <h2 className="text-5xl md:text-9xl font-black text-white mb-10 tracking-tight drop-shadow-lg">
              Don't leave money <br /> on the table.
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-16 py-8 bg-white text-black rounded-full font-black text-2xl hover:bg-slate-100 transition-all shadow-2xl relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-3">
                  Get Started for Free <ArrowRight />
              </span>
            </motion.button>
            <p className="mt-8 text-white/80 font-medium text-lg">No credit card required • Cancel anytime</p>
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-16 px-6 border-t border-white/10 text-center text-slate-500 text-sm bg-black/80 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
             <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <Logo className="w-8 h-8 text-white" />
                <span className="font-bold text-2xl text-white">ScholarAI</span>
             </div>
             <p className="max-w-md mx-auto">Democratizing access to education funding through artificial intelligence.</p>
        </div>
        <div className="flex justify-center gap-8 mb-12 text-xs font-bold uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
        </div>
        <p>© 2024 ScholarAI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

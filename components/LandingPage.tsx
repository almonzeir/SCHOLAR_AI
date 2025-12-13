import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Shield, Zap, GraduationCap, CheckCircle2, PlayCircle, Users, Menu, X } from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-deep-space text-white overflow-hidden relative selection:bg-orange-500 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div style={{ y: y1 }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] animate-blob" />
        <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        {/* CSS Noise Texture (Data URI for robustness) */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PHZlRmVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto mt-4"
      >
        <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10">
          <Logo className="w-6 h-6 text-orange-500" />
          <span className="text-lg font-bold tracking-tight">
            Scholar<span className="text-orange-500">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 glass-card px-2 py-1.5 rounded-full backdrop-blur-xl bg-white/5 border border-white/10">
            <a href="#features" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-all">Features</a>
            <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-all">How it Works</a>
            <a href="#testimonials" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-all">Stories</a>
        </div>

        <div className="flex items-center gap-4">
            <button
            onClick={onGetStarted}
            className="hidden md:block bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transform hover:scale-105 active:scale-95"
            >
            Login
            </button>
            <button className="md:hidden p-2 glass-card rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xl pt-24 px-6 md:hidden"
          >
              <div className="flex flex-col gap-6 text-center">
                  <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Features</a>
                  <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">How it Works</a>
                  <button onClick={onGetStarted} className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-xl mt-4">Get Started</button>
              </div>
          </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-32 md:pt-48 md:pb-48 px-6 max-w-7xl mx-auto text-center perspective-1000">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-8 backdrop-blur-md animate-float hover:bg-orange-500/20 transition-colors cursor-default"
        >
          <Sparkles className="w-4 h-4 fill-orange-500" />
          <span className="tracking-wide uppercase text-xs font-bold">AI-Powered Scholarship Matching</span>
        </motion.div>

        <motion.h1
          style={{ opacity }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter mb-8 leading-[0.9] text-white drop-shadow-2xl"
        >
          Unlock Your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 animate-gradient-x bg-[length:200%_auto]">
            Future Potential
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
        >
          Stop searching manually. Our AI scans <span className="text-white font-semibold">global databases</span> to match your unique profile with millions in funding opportunities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 relative"
        >
           {/* Glow Effect behind button */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500/40 blur-[50px] -z-10 rounded-full animate-pulse"></div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="group relative px-8 py-5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-full font-bold text-xl transition-all shadow-[0_0_40px_rgba(249,115,22,0.4)] flex items-center justify-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">Get Started Free</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-xl transition-all backdrop-blur-md flex items-center gap-2 group"
          >
            <PlayCircle className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
            <span>Watch Demo</span>
          </motion.button>
        </motion.div>

        {/* Stats Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 pt-10 border-t border-white/5"
        >
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-8">Trusted by students from</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-2 group cursor-pointer">
                   <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors"><GraduationCap className="w-6 h-6 text-white" /></div>
                   <span className="font-bold text-lg text-slate-300 group-hover:text-white transition-colors">Harvard</span>
               </div>
               <div className="flex items-center gap-2 group cursor-pointer">
                   <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors"><Globe className="w-6 h-6 text-white" /></div>
                   <span className="font-bold text-lg text-slate-300 group-hover:text-white transition-colors">Stanford</span>
               </div>
               <div className="flex items-center gap-2 group cursor-pointer">
                   <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors"><Shield className="w-6 h-6 text-white" /></div>
                   <span className="font-bold text-lg text-slate-300 group-hover:text-white transition-colors">MIT</span>
               </div>
            </div>
        </motion.div>
      </section>

      {/* Features Grid - Bento Style */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 text-glow"
          >
            Why ScholarAI?
          </motion.h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">We combine cutting-edge Gemini AI models with a massive database to do the heavy lifting for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             whileHover={{ y: -10 }}
             className="md:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 hover:border-orange-500/30 transition-all backdrop-blur-xl relative overflow-hidden group"
          >
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] -z-10 group-hover:bg-orange-500/20 transition-colors"></div>
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-8 border border-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Instant AI Matching</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">Upload your resume or speak to our AI assistant. We extract your achievements, grades, and interests to find scholarships you didn't know existed.</p>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             whileHover={{ y: -10 }}
             className="p-10 rounded-[2.5rem] bg-black/40 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur-xl relative overflow-hidden group"
          >
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Global Reach</h3>
              <p className="text-slate-400">Access opportunities from 50+ countries. We handle currency conversion and eligibility checks.</p>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.3 }}
             whileHover={{ y: -10 }}
             className="p-10 rounded-[2.5rem] bg-black/40 border border-white/10 hover:border-green-500/30 transition-all backdrop-blur-xl relative overflow-hidden group"
          >
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-900/20 to-transparent"></div>
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Data Privacy</h3>
              <p className="text-slate-400">Your profile is encrypted. We use it solely to find you money. No selling data. Ever.</p>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.4 }}
             whileHover={{ y: -10 }}
             className="md:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-bl from-purple-900/20 to-black/40 border border-white/10 hover:border-purple-500/30 transition-all backdrop-blur-xl relative overflow-hidden group"
          >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Actionable Insights</h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">Don't just get a list. Get a strategy. Our AI suggests how to improve your profile to increase your winning chances.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-[3rem] bg-gradient-to-r from-orange-600 to-amber-600 p-12 md:p-24 text-center relative overflow-hidden shadow-[0_0_100px_rgba(234,88,12,0.3)] group"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PHZlRmVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-20 mix-blend-overlay"></div>

          {/* Animated rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000 delay-100"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">Ready to secure your future?</h2>
            <p className="text-white/90 text-xl mb-12 max-w-2xl mx-auto font-medium">Join 10,000+ students who have found over $25M in scholarships.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-12 py-5 bg-white text-orange-600 rounded-full font-bold text-xl hover:bg-slate-100 transition-all shadow-2xl"
            >
              Start Your Journey Now
            </motion.button>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm glass-dark">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
             <Logo className="w-5 h-5" />
             <span className="font-bold">ScholarAI</span>
        </div>
        <p>© 2024 ScholarAI. Built for the future of education.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

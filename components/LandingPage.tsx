import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Shield, Zap, GraduationCap, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
            <Logo className="w-8 h-8 text-orange-500" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Scholar<span className="text-orange-500">AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a>
        </div>
        <button
          onClick={onGetStarted}
          className="bg-white text-black px-5 py-2.5 rounded-full font-semibold hover:bg-slate-200 transition-colors"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 md:pt-32 md:pb-48 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-medium mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Scholarship Matching</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
        >
          Unlock Your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">Future Potential</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Stop searching for scholarships manually. Let our advanced AI analyze your profile and find the perfect funding opportunities for your education.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-lg transition-all backdrop-blur-md">
            Watch Demo
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12"
        >
          {[
            { label: 'Active Users', value: '10K+' },
            { label: 'Scholarships Found', value: '$25M+' },
            { label: 'Success Rate', value: '94%' },
            { label: 'Countries', value: '50+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ScholarAI?</h2>
          <p className="text-slate-400">Powered by Gemini AI, designed for students.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6 text-yellow-400" />,
              title: "Instant Matching",
              desc: "Upload your resume or speak to our AI, and get matched with scholarships in seconds."
            },
            {
              icon: <Globe className="w-6 h-6 text-blue-400" />,
              title: "Global Database",
              desc: "Access thousands of verified scholarships from universities worldwide."
            },
            {
              icon: <Shield className="w-6 h-6 text-green-400" />,
              title: "Secure & Private",
              desc: "Your data is encrypted and used only to find you the best opportunities."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-r from-orange-600 to-amber-600 p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to secure your future?</h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">Join thousands of students finding their dream scholarships today.</p>
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors shadow-xl"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t border-white/10 text-center text-slate-500 text-sm">
        <p>© 2024 ScholarAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

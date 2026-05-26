import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Cpu, Sliders, BarChart3, ChevronRight, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-12 md:py-20 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nature-500/10 text-nature-400 border border-nature-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
          <Cpu className="h-3.5 w-3.5 animate-pulse" />
          Dataset-Driven ML Suggestions
        </div>
        
        <h1 className="font-outfit text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Optimize Your Yield With the{' '}
          <span className="text-gradient-emerald">Crop Suggestion System</span>
        </h1>
        
        <p className="text-slate-400 md:text-lg max-w-2xl mx-auto mb-8 font-light">
          Unlock your soil's full potential. Enter chemical parameters and climatic indicators to get real-time crop suggestions, personalized fertilizer remedies, and yield estimates based on machine learning.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/predict"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-nature-600 hover:bg-nature-500 text-white font-medium px-8 py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-nature-600/20 hover:shadow-nature-600/35"
          >
            Get Crop Suggestions
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 hover:text-white px-8 py-3.5 rounded-2xl transition-all duration-200"
          >
            Create Free Account
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Grid of Key Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-16 md:mb-24 animate-fade-in delay-100">
        {/* Feature 1 */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <div className="p-3 bg-nature-500/10 border border-nature-500/20 rounded-xl w-fit text-nature-400 mb-5">
            <Cpu className="h-6 w-6" />
          </div>
          <h3 className="font-outfit text-xl font-bold text-white mb-2">Random Forest AI Model</h3>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Predict the ideal crop from 50 options using a Random Forest Classifier trained on agricultural datasets with 98% accuracy.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit text-indigo-400 mb-5">
            <Sliders className="h-6 w-6" />
          </div>
          <h3 className="font-outfit text-xl font-bold text-white mb-2">Fertilizer Advisory</h3>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Get targeted soil amendments when Nitrogen, Phosphorus, Potassium levels or pH fall outside the crop's optimal statistical threshold.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-card glass-card-hover p-6 rounded-2xl">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl w-fit text-amber-400 mb-5">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="font-outfit text-xl font-bold text-white mb-2">Yield Estimation</h3>
          <p className="text-slate-400 text-sm font-light leading-relaxed">
            Estimate expected agricultural yield range per hectare, calculated using climate deviation indexes for temperature and rainfall.
          </p>
        </div>
      </div>

      {/* Trust & Stats Banner */}
      <div className="glass-card rounded-3xl p-8 md:p-10 border border-slate-700/60 shadow-xl flex flex-col md:flex-row gap-8 items-center justify-around text-center md:text-left animate-fade-in delay-200">
        <div>
          <h4 className="font-outfit text-lg font-semibold text-nature-400 mb-1">Empowering Smart Farming</h4>
          <p className="text-slate-400 font-light text-sm max-w-sm">
            Harnessing agricultural datasets to help farmers make data-driven crop selections and fertilization choices.
          </p>
        </div>
        <div className="flex gap-10">
          <div>
            <div className="font-outfit text-3xl md:text-4xl font-extrabold text-white">98.4%</div>
            <div className="text-xs text-slate-400 font-medium uppercase mt-1">Model Accuracy</div>
          </div>
          <div>
            <div className="font-outfit text-3xl md:text-4xl font-extrabold text-white">50+</div>
            <div className="text-xs text-slate-400 font-medium uppercase mt-1">Crops Supported</div>
          </div>
          <div>
            <div className="font-outfit text-3xl md:text-4xl font-extrabold text-white">Instant</div>
            <div className="text-xs text-slate-400 font-medium uppercase mt-1">Inference Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

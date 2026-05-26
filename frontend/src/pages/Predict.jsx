import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Sprout, 
  HelpCircle, 
  Sliders, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Compass, 
  Wrench, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Predict = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // Form Inputs
  const [inputs, setInputs] = useState({
    N: 80,
    P: 45,
    K: 40,
    temperature: 24.5,
    humidity: 78.0,
    ph: 6.2,
    rainfall: 180.0
  });

  // State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('crop'); // crop, fertilizer, yield

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleResetInputs = () => {
    setInputs({
      N: 80,
      P: 45,
      K: 40,
      temperature: 24.5,
      humidity: 78.0,
      ph: 6.2,
      rainfall: 180.0
    });
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    // Validate ph
    if (inputs.ph < 3.0 || inputs.ph > 10.0) {
      setError('Soil pH must be between 3.0 and 10.0');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/predict', inputs);
      setResult(res.data.data);
      setActiveTab('crop');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to the prediction server. Please make sure the backend and AI services are running.');
    } finally {
      setLoading(false);
    }
  };

  const formatCropName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Helper for quick-fill options (realistic profiles)
  const quickFill = (type) => {
    const profiles = {
      clay_rice: { N: 85, P: 40, K: 42, temperature: 25.2, humidity: 82.5, ph: 6.2, rainfall: 220.5 },
      dry_beans: { N: 25, P: 60, K: 20, temperature: 19.8, humidity: 21.0, ph: 5.8, rainfall: 42.0 },
      orchard_grapes: { N: 30, P: 130, K: 200, temperature: 22.4, humidity: 81.2, ph: 5.7, rainfall: 70.0 },
      coastal_coconut: { N: 20, P: 18, K: 30, temperature: 27.5, humidity: 94.2, ph: 5.8, rainfall: 185.4 }
    };
    if (profiles[type]) {
      setInputs(profiles[type]);
    }
  };

  return (
    <div className="flex-1 px-4 py-8 md:px-8 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="font-outfit text-3xl font-extrabold text-white">Intelligent Soil Assessment</h1>
        <p className="text-slate-400 text-sm mt-2">
          Input your chemical soil ratios and environmental measurements to calculate the best crop to cultivate, nutrient amendments, and potential production metrics.
        </p>
      </div>

      {error && (
        <div className="mb-8 max-w-4xl mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error:</span> {error}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        {/* INPUT FORM (Left column) */}
        <div className="lg:col-span-7 glass-card p-6 md:p-8 rounded-3xl border border-slate-700/60 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/40">
            <h2 className="font-outfit text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-nature-400" />
              Soil & Climate Parameters
            </h2>
            <button 
              onClick={handleResetInputs}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Quick Fills */}
          <div className="mb-6 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
              Quick Test Profiles
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                type="button" 
                onClick={() => quickFill('clay_rice')} 
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-nature-500/10 text-slate-300 hover:text-nature-400 border border-slate-700/60 hover:border-nature-500/30 transition-all"
              >
                Wet Clay (Rice)
              </button>
              <button 
                type="button" 
                onClick={() => quickFill('dry_beans')} 
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-nature-500/10 text-slate-300 hover:text-nature-400 border border-slate-700/60 hover:border-nature-500/30 transition-all"
              >
                Dry Acidic (Beans)
              </button>
              <button 
                type="button" 
                onClick={() => quickFill('orchard_grapes')} 
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-nature-500/10 text-slate-300 hover:text-nature-400 border border-slate-700/60 hover:border-nature-500/30 transition-all"
              >
                High Potash (Grapes)
              </button>
              <button 
                type="button" 
                onClick={() => quickFill('coastal_coconut')} 
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-nature-500/10 text-slate-300 hover:text-nature-400 border border-slate-700/60 hover:border-nature-500/30 transition-all"
              >
                Tropical Wet (Coconut)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NPK Inputs Grid */}
            <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/40">
              <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-nature-400" />
                Soil Chemical Nutrients (ppm)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Nitrogen */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-300 font-medium">Nitrogen (N)</label>
                    <span className="text-xs font-semibold text-nature-400 font-mono">{inputs.N}</span>
                  </div>
                  <input
                    type="range"
                    name="N"
                    min="0"
                    max="150"
                    step="1"
                    value={inputs.N}
                    onChange={handleInputChange}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-nature-500"
                  />
                  <span className="text-[10px] text-slate-500">Typical: 10 - 120</span>
                </div>

                {/* Phosphorus */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-300 font-medium">Phosphorus (P)</label>
                    <span className="text-xs font-semibold text-nature-400 font-mono">{inputs.P}</span>
                  </div>
                  <input
                    type="range"
                    name="P"
                    min="5"
                    max="150"
                    step="1"
                    value={inputs.P}
                    onChange={handleInputChange}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-nature-500"
                  />
                  <span className="text-[10px] text-slate-500">Typical: 5 - 140</span>
                </div>

                {/* Potassium */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-300 font-medium">Potassium (K)</label>
                    <span className="text-xs font-semibold text-nature-400 font-mono">{inputs.K}</span>
                  </div>
                  <input
                    type="range"
                    name="K"
                    min="5"
                    max="250"
                    step="1"
                    value={inputs.K}
                    onChange={handleInputChange}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-nature-500"
                  />
                  <span className="text-[10px] text-slate-500">Typical: 5 - 210</span>
                </div>
              </div>
            </div>

            {/* Environmental Climate Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Temperature */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-orange-400" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  step="0.1"
                  min="-10"
                  max="60"
                  value={inputs.temperature}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 focus:border-nature-500 focus:outline-none focus:ring-1 focus:ring-nature-500 text-slate-200 font-mono text-sm"
                  required
                />
              </div>

              {/* Humidity */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  Relative Humidity (%)
                </label>
                <input
                  type="number"
                  name="humidity"
                  step="0.1"
                  min="0"
                  max="100"
                  value={inputs.humidity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 focus:border-nature-500 focus:outline-none focus:ring-1 focus:ring-nature-500 text-slate-200 font-mono text-sm"
                  required
                />
              </div>

              {/* Soil pH */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-yellow-500" />
                  Soil pH (3.0 - 10.0)
                </label>
                <input
                  type="number"
                  name="ph"
                  step="0.01"
                  min="3.0"
                  max="10.0"
                  value={inputs.ph}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 focus:border-nature-500 focus:outline-none focus:ring-1 focus:ring-nature-500 text-slate-200 font-mono text-sm"
                  required
                />
              </div>

              {/* Rainfall */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CloudRain className="h-4 w-4 text-sky-400" />
                  Average Rainfall (mm)
                </label>
                <input
                  type="number"
                  name="rainfall"
                  step="0.1"
                  min="0"
                  max="500"
                  value={inputs.rainfall}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 focus:border-nature-500 focus:outline-none focus:ring-1 focus:ring-nature-500 text-slate-200 font-mono text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-nature-600 hover:bg-nature-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-nature-600/10 hover:shadow-nature-600/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Analyzing Soil & Running ML Model...
                </>
              ) : (
                <>
                  <Sprout className="h-5 w-5" />
                  Run Soil Diagnostic
                </>
              )}
            </button>
          </form>
        </div>

        {/* SUGGESTION RESULTS PANEL (Right column) */}
        <div className="lg:col-span-5">
          {/* EMPTY / LOADING STATE */}
          {!result && !loading && (
            <div className="glass-card p-8 rounded-3xl border border-slate-700/60 shadow-xl text-center h-[520px] flex flex-col items-center justify-center">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-3xl w-fit text-slate-600 mb-4 animate-bounce">
                <Sprout className="h-10 w-10" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white mb-2">Diagnostic Awaiting</h3>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Adjust the sliders and parameters on the left and trigger the "Run Soil Diagnostic" button to review predictions, custom fertilizer plans, and productivity estimations.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-card p-8 rounded-3xl border border-slate-700/60 shadow-xl text-center h-[520px] flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-full border-4 border-nature-600/20 border-t-nature-500 animate-spin"></div>
                <Sprout className="h-8 w-8 text-nature-400 absolute top-6 left-6 animate-pulse" />
              </div>
              <h3 className="font-outfit text-lg font-bold text-white mb-1.5">Analyzing Soil Metrics</h3>
              <p className="text-slate-500 text-xs max-w-xs animate-pulse">
                Forwarding data parameters to AI service and processing neural mapping classification...
              </p>
            </div>
          )}

          {/* SUGGESTION RESULTS DISPLAY */}
          {result && !loading && (
            <div className="glass-card rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden min-h-[520px] flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-700/50 bg-slate-900/40">
                <button
                  onClick={() => setActiveTab('crop')}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'crop'
                      ? 'border-nature-500 text-nature-400 bg-nature-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sprout className="h-4 w-4" />
                  Crop
                </button>
                <button
                  onClick={() => setActiveTab('fertilizer')}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'fertilizer'
                      ? 'border-nature-500 text-nature-400 bg-nature-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  Fertilizers
                </button>
                <button
                  onClick={() => setActiveTab('yield')}
                  className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'yield'
                      ? 'border-nature-500 text-nature-400 bg-nature-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Yield
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                
                {/* 1. CROP PREDICTION TAB */}
                {activeTab === 'crop' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center bg-slate-900/30 p-6 rounded-2xl border border-slate-800/40">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                        Best Recommended Crop
                      </span>
                      <h2 className="font-outfit text-3xl font-extrabold text-white mb-3">
                        {formatCropName(result.predictedCrop)}
                      </h2>
                      
                      {/* confidence bar */}
                      <div className="max-w-[200px] mx-auto">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Confidence Score</span>
                          <span className="font-semibold text-nature-400">{(result.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-nature-600 to-nature-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${result.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed flex gap-2.5">
                      <Info className="h-5 w-5 text-nature-400 shrink-0 mt-0.5" />
                      <div>
                        This recommendation is generated by the AI classifier which correlates NPK compounds, thermal transpiration, water levels (rainfall), and acidity coefficients against ideal agricultural dataset benchmarks.
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FERTILIZER ADVISORY TAB */}
                {activeTab === 'fertilizer' && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Diagnostic Status</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        result.fertilizerRecommendation.status === 'Optimal'
                          ? 'bg-nature-500/10 text-nature-400 border border-nature-500/20'
                          : result.fertilizerRecommendation.status === 'Attention Needed'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {result.fertilizerRecommendation.status}
                      </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[220px] pr-2">
                      {result.fertilizerRecommendation.details.map((d, index) => (
                        <div key={index} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-white uppercase">{d.nutrient}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === 'Optimal' 
                                ? 'bg-nature-500/15 text-nature-400' 
                                : d.status.includes('Low') 
                                ? 'bg-amber-500/15 text-amber-400' 
                                : 'bg-red-500/15 text-red-400'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                          <p className="text-slate-400 leading-relaxed font-light mb-2">{d.message}</p>
                          {d.remedy && (
                            <div className="text-[11px] text-nature-400 font-medium flex items-center gap-1">
                              <Wrench className="h-3 w-3" /> Remedy: {d.remedy}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. YIELD ESTIMATION TAB */}
                {activeTab === 'yield' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/40 text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                        Expected Productivity Range
                      </span>
                      <div className="font-outfit text-3xl font-extrabold text-white flex items-center justify-center gap-1 mb-1">
                        <span className="text-nature-400">{result.yieldEstimation.minYield.toFixed(1)}</span>
                        <span className="text-slate-600 text-xl font-normal">-</span>
                        <span className="text-nature-400">{result.yieldEstimation.maxYield.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {result.yieldEstimation.unit}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs">
                        <span className="text-slate-400 font-semibold uppercase tracking-wide block mb-1.5">Climatic Suitability Explanation</span>
                        <p className="text-slate-400 font-light leading-relaxed bg-slate-900/30 p-3 rounded-xl border border-slate-800/50">
                          {result.yieldEstimation.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logged in notification / footer */}
                <div className="mt-6 pt-4 border-t border-slate-700/40">
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-nature-500/10 border border-nature-500/20 text-nature-400 text-xs">
                      <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                      <span>Authenticated Session: Suggestion saved to your prediction history!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                      <span>Guest Mode: Register or Log in to save suggestions and access metrics!</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predict;

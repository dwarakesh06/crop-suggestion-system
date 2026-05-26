import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { History, Sprout, Search, ChevronLeft, ChevronRight, X, Calendar, Droplets, Thermometer, CloudRain, Wrench, BarChart2 } from 'lucide-react';

const HistoryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch user history
      const res = await api.get(`/history?page=${page}&limit=8`);
      setLogs(res.data.data);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatCropName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const filteredLogs = logs.filter(log => 
    log.predictedCrop.toLowerCase().includes(searchCrop.toLowerCase())
  );

  return (
    <div className="flex-1 px-4 py-8 md:px-8 max-w-7xl mx-auto w-full animate-fade-in relative">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <History className="h-6 w-6 text-nature-400" />
            Prediction History
          </h1>
          <p className="text-slate-400 text-sm mt-1">Audit and review all your past soil diagnostic logs.</p>
        </div>

        {/* Filter Input */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by crop name..."
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 focus:border-nature-500 focus:outline-none focus:ring-1 focus:ring-nature-500 text-slate-200 text-sm"
          />
        </div>
      </div>

      {/* History Grid */}
      <div className="glass-card rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-nature-500 border-t-transparent"></div>
            <p className="text-slate-400 text-sm animate-pulse">Loading prediction history...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center">
            <History className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-1">No logs found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              {searchCrop ? 'No matching logs for this crop. Try a different search.' : 'You have not run any crop predictions yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Predicted Crop</th>
                  <th className="px-6 py-4">Nitrogen (N)</th>
                  <th className="px-6 py-4">Phosphorus (P)</th>
                  <th className="px-6 py-4">Potassium (K)</th>
                  <th className="px-6 py-4">Soil pH</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/10">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <div className="p-1.5 bg-nature-500/10 text-nature-400 rounded-md">
                        <Sprout className="h-4 w-4" />
                      </div>
                      {formatCropName(log.predictedCrop)}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{log.inputs.N} ppm</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{log.inputs.P} ppm</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{log.inputs.K} ppm</td>
                    <td className="px-6 py-4 font-mono text-slate-400">{log.inputs.ph.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-nature-500/10 text-nature-400 border border-nature-500/20">
                        {(log.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700/60 text-xs font-semibold transition-all"
                      >
                        View Analysis
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2 bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs text-slate-400 font-medium">
            Page <span className="text-white font-bold">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* DETAILS OVERLAY MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/60 bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-nature-500/20 text-nature-400 rounded-xl">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-outfit text-xl font-bold text-white">
                    {formatCropName(selectedLog.predictedCrop)} Suggestion
                  </h3>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 uppercase tracking-wider font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
              {/* Inputs Summary */}
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                  Input Parameters
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold mb-0.5 uppercase">Nitrogen</div>
                    <div className="text-white font-bold">{selectedLog.inputs.N} ppm</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold mb-0.5 uppercase">Phosphorus</div>
                    <div className="text-white font-bold">{selectedLog.inputs.P} ppm</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold mb-0.5 uppercase">Potassium</div>
                    <div className="text-white font-bold">{selectedLog.inputs.K} ppm</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold mb-0.5 uppercase">Soil pH</div>
                    <div className="text-white font-bold">{selectedLog.inputs.ph.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold mb-0.5 uppercase flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-orange-400" /> Temp
                    </div>
                    <div className="text-white font-bold">{selectedLog.inputs.temperature.toFixed(1)} °C</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold mb-0.5 uppercase flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-400" /> Humidity
                    </div>
                    <div className="text-white font-bold">{selectedLog.inputs.humidity.toFixed(1)} %</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 sm:col-span-2">
                    <div className="text-[10px] text-slate-500 font-semibold mb-0.5 uppercase flex items-center gap-1">
                      <CloudRain className="h-3 w-3 text-sky-400" /> Rainfall
                    </div>
                    <div className="text-white font-bold">{selectedLog.inputs.rainfall.toFixed(1)} mm</div>
                  </div>
                </div>
              </div>

              {/* Fertilizer Recommendation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-indigo-400" />
                    Fertilizer Advisory
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedLog.fertilizerRecommendation.status === 'Optimal'
                      ? 'bg-nature-500/10 text-nature-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {selectedLog.fertilizerRecommendation.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedLog.fertilizerRecommendation.details.map((d, index) => (
                    <div key={index} className="bg-slate-900/30 border border-slate-800/80 p-3.5 rounded-xl text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white uppercase">{d.nutrient}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          d.status === 'Optimal' ? 'bg-nature-500/15 text-nature-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>{d.status}</span>
                      </div>
                      <p className="text-slate-400 font-light leading-relaxed mb-2">{d.message}</p>
                      {d.remedy && (
                        <div className="text-[10px] text-nature-400 font-medium font-mono">
                          Remedy: {d.remedy}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Yield Estimation */}
              <div className="space-y-3">
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-amber-400" />
                  Yield Estimation
                </h4>
                
                <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-2xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Estimated Yield Range</span>
                    <span className="font-mono font-bold text-white text-sm bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                      {selectedLog.yieldEstimation.minYield.toFixed(2)} - {selectedLog.yieldEstimation.maxYield.toFixed(2)} {selectedLog.yieldEstimation.unit}
                    </span>
                  </div>
                  <div className="text-slate-400 font-light leading-relaxed border-t border-slate-800/50 pt-2.5">
                    {selectedLog.yieldEstimation.explanation}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700/60 bg-slate-900/40 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default HistoryLogs;

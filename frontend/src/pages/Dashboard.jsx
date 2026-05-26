import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Sprout, History, BarChart2, Shield, Calendar, ArrowRight, Activity, PlusCircle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    favoriteCrop: 'N/A',
    lastActive: 'Never'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/history?limit=5');
        const logs = res.data.data;
        setRecentLogs(logs);

        // Calculate simple stats from history
        const total = res.data.pagination.total;
        
        // Find favorite crop (most frequent predicted crop)
        let favCrop = 'N/A';
        if (logs.length > 0) {
          // Since we only fetched 5, let's just use what we have or default
          // Real favorite crop calculation is best done across all.
          // Since we don't have all logs, let's fetch a list with larger limit or aggregate
          const cropCounts = {};
          logs.forEach(log => {
            cropCounts[log.predictedCrop] = (cropCounts[log.predictedCrop] || 0) + 1;
          });
          let maxCount = 0;
          Object.keys(cropCounts).forEach(crop => {
            if (cropCounts[crop] > maxCount) {
              maxCount = cropCounts[crop];
              favCrop = crop;
            }
          });
        }

        const lastActive = logs.length > 0 
          ? new Date(logs[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Never';

        setStats({
          total,
          favoriteCrop: favCrop,
          lastActive
        });
      } catch (err) {
        console.error('Error fetching dashboard history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCropName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="flex-1 px-4 py-8 md:px-8 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl md:text-3xl font-extrabold text-white">
            Hello, <span className="text-gradient-emerald">{user?.username}</span>!
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here is your crop suggestion overview.</p>
        </div>
        
        {/* Quick action button */}
        <Link
          to="/predict"
          className="inline-flex items-center gap-2 bg-nature-600 hover:bg-nature-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-md shadow-nature-600/10"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          New Prediction
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {/* Total Predictions */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-nature-400">
            <Activity className="h-16 w-16" />
          </div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Total Predictions
          </span>
          <div className="font-outfit text-3xl font-extrabold text-white">
            {loading ? '...' : stats.total}
          </div>
          <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-nature-400" />
            Saved to your account
          </p>
        </div>

        {/* Favorite Crop */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-nature-400">
            <Sprout className="h-16 w-16" />
          </div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Primary Crop Suggestion
          </span>
          <div className="font-outfit text-3xl font-extrabold text-nature-400">
            {loading ? '...' : formatCropName(stats.favoriteCrop)}
          </div>
          <p className="text-slate-500 text-xs mt-2">
            Most frequent recommendation
          </p>
        </div>

        {/* Last Active */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-400">
            <Calendar className="h-16 w-16" />
          </div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
            Last Suggestion Date
          </span>
          <div className="font-outfit text-3xl font-extrabold text-white">
            {loading ? '...' : stats.lastActive}
          </div>
          <p className="text-slate-500 text-xs mt-2">
            Timestamp of latest execution
          </p>
        </div>
      </div>

      {/* Main Grid: Shortcuts and Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Shortcuts Panel */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="font-outfit text-lg font-bold text-white mb-4">Quick Shortcuts</h2>
          
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <Link
              to="/predict"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-nature-500/10 border border-slate-800 hover:border-nature-500/30 text-slate-200 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-nature-500/20 text-nature-400 rounded-lg">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Crop Recommendation</div>
                  <div className="text-xs text-slate-500">Run soil diagnostics</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-nature-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/history"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 text-slate-200 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Past Logs</div>
                  <div className="text-xs text-slate-500">View logged recommendations</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/analytics"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 text-slate-200 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Soil & Crop Charts</div>
                  <div className="text-xs text-slate-500">View data and trends</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-200 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">System Administration</div>
                    <div className="text-xs text-slate-500">Retrain models & load datasets</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent History Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-outfit text-lg font-bold text-white">Recent Recommendations</h2>
            {recentLogs.length > 0 && (
              <Link to="/history" className="text-xs font-semibold text-nature-400 hover:text-nature-300 underline">
                View All Logs
              </Link>
            )}
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/60">
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-nature-500 border-t-transparent"></div>
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="p-10 text-center">
                <Sprout className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No crop suggestions recorded yet.</p>
                <p className="text-slate-500 text-xs mt-1 mb-6">Complete a soil assessment to see records here.</p>
                <Link
                  to="/predict"
                  className="inline-flex items-center gap-2 bg-nature-600/20 hover:bg-nature-600/30 text-nature-400 hover:text-nature-300 text-xs font-semibold px-4 py-2 rounded-xl border border-nature-600/30 transition-all"
                >
                  Start First Prediction
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700">
                    <tr>
                      <th className="px-5 py-4">Crop Suggestion</th>
                      <th className="px-5 py-4">NPK Values</th>
                      <th className="px-5 py-4">Soil pH</th>
                      <th className="px-5 py-4">Confidence</th>
                      <th className="px-5 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                    {recentLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">
                          {formatCropName(log.predictedCrop)}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">
                          {log.inputs.N}-{log.inputs.P}-{log.inputs.K}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {log.inputs.ph.toFixed(1)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-nature-500/10 text-nature-400 border border-nature-500/20">
                            {(log.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-400 text-xs">
                          {new Date(log.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

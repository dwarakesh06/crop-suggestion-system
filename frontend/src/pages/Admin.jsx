import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Shield, 
  Users, 
  Database, 
  Cpu, 
  Trash2, 
  UploadCloud, 
  BarChart, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  FileSpreadsheet, 
  Clock 
} from 'lucide-react';

const Admin = () => {
  // Tabs: ml, users, predictions
  const [activeTab, setActiveTab] = useState('ml');
  
  // Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [predPagination, setPredPagination] = useState({ page: 1, pages: 1 });
  const [predPage, setPredPage] = useState(1);
  
  // Action States
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [mlMessage, setMlMessage] = useState({ type: '', text: '' });
  const [deleteLoading, setDeleteLoading] = useState(null); // id of user/prediction being deleted

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'predictions') {
      fetchPredictions();
    }
  }, [activeTab, predPage]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/predictions?page=${predPage}&limit=10`);
      setPredictions(res.data.data);
      setPredPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching all predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setUploadFile(file);
      setMlMessage({ type: '', text: '' });
    } else {
      setMlMessage({ type: 'error', text: 'Please select a valid CSV dataset file.' });
      setUploadFile(null);
    }
  };

  const handleDatasetUploadAndTrain = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setMlMessage({ type: 'info', text: 'Uploading dataset and invoking AI service retraining...' });

    const formData = new FormData();
    formData.append('dataset', uploadFile);

    try {
      const res = await api.post('/admin/dataset-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { metrics } = res.data;
      setMlMessage({
        type: 'success',
        text: `Success! Model retrained with ${metrics.total_records} records. New Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%.`
      });
      setUploadFile(null);
      fetchStats(); // Refresh uploads list
    } catch (err) {
      console.error(err);
      setMlMessage({
        type: 'error',
        text: err.response?.data?.message || 'Retraining failed. Check AI Service logs.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also wipe their prediction log history.')) return;
    
    setDeleteLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeletePrediction = async (predId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion log?')) return;
    
    setDeleteLoading(predId);
    try {
      await api.delete(`/admin/predictions/${predId}`);
      fetchPredictions();
      fetchStats();
    } catch (err) {
      alert('Failed to delete log');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatCropName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="flex-1 px-4 py-8 md:px-8 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Title */}
      <div className="mb-8 border-b border-slate-700/40 pb-4">
        <h1 className="font-outfit text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-400" />
          System Administration
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure ML training scripts, upload custom datasets, and audit records.</p>
      </div>

      {/* Grid Tabs Header */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('ml')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
            activeTab === 'ml'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
          }`}
        >
          <Cpu className="h-4 w-4" />
          ML Operations
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
            activeTab === 'users'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          User Accounts
        </button>
        <button
          onClick={() => setActiveTab('predictions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
            activeTab === 'predictions'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
          }`}
        >
          <Database className="h-4 w-4" />
          Prediction Database
        </button>
      </div>

      {/* CONTENT PANELS */}
      
      {/* 1. ML OPERATIONS PANEL */}
      {activeTab === 'ml' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Upload & Retrain Card */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/60 shadow-xl space-y-6">
              <h2 className="font-outfit text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-nature-400" />
                Upload Dataset & Retrain Model
              </h2>
              
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                Provide a CSV file matching the features: <code className="font-mono text-white bg-slate-900 px-1 py-0.5 rounded text-[10px]">N,P,K,temperature,humidity,ph,rainfall,label</code>. The system will store the file in the database logs and re-calibrate the Random Forest Classifier weights.
              </p>

              {mlMessage.text && (
                <div className={`p-4 rounded-xl border text-xs flex gap-2 ${
                  mlMessage.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : mlMessage.type === 'success'
                    ? 'bg-nature-500/10 border-nature-500/20 text-nature-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse'
                }`}>
                  {mlMessage.type === 'error' && <AlertTriangle className="h-5 w-5 shrink-0" />}
                  {mlMessage.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0" />}
                  {mlMessage.type === 'info' && <Loader2 className="h-5 w-5 shrink-0 animate-spin" />}
                  <span>{mlMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleDatasetUploadAndTrain} className="space-y-4">
                <div className="border-2 border-dashed border-slate-700 hover:border-nature-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-slate-900/30">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <FileSpreadsheet className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  {uploadFile ? (
                    <div>
                      <p className="text-sm font-semibold text-white">{uploadFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(uploadFile.size / 1024).toFixed(1)} KB • Click to swap</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Click or Drag CSV here to upload</p>
                      <p className="text-[10px] text-slate-500 mt-1">CSV file format only, max size 10MB</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="w-full bg-nature-600 hover:bg-nature-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Retraining Model...
                    </>
                  ) : (
                    <>
                      <Cpu className="h-4 w-4" />
                      Upload & Run Training
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Model stats summary */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/60 shadow-xl space-y-6">
              <h2 className="font-outfit text-lg font-bold text-white flex items-center gap-2">
                <BarChart className="h-5 w-5 text-indigo-400" />
                Active Model Summaries
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                    Dataset uploads
                  </span>
                  <span className="font-outfit text-2xl font-bold text-white">
                    {stats?.recentUploads?.length || 0}
                  </span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                    System accuracy
                  </span>
                  <span className="font-outfit text-2xl font-bold text-nature-400">
                    {stats?.recentUploads && stats.recentUploads.length > 0 && stats.recentUploads[0].status === 'trained'
                      ? `${(stats.recentUploads[0].accuracy * 100).toFixed(1)}%`
                      : '98.5%'}
                  </span>
                </div>
              </div>

              {/* Uploads history */}
              <div className="space-y-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                  Dataset Upload Logs
                </span>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {!stats?.recentUploads || stats.recentUploads.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No uploads recorded yet.</p>
                  ) : (
                    stats.recentUploads.map((up) => (
                      <div key={up._id} className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                        <div className="truncate max-w-[200px]">
                          <span className="text-white font-medium block truncate">{up.filename}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {new Date(up.createdAt).toLocaleDateString()} by {up.uploadedBy?.username}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold block ${
                            up.status === 'trained' 
                              ? 'bg-nature-500/10 text-nature-400' 
                              : up.status === 'training'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {up.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                            {up.recordCount} rows
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. USER ACCOUNTS PANEL */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-nature-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/10">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/25 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{u.username}</td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' 
                            ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u.role === 'admin' || deleteLoading === u._id}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all"
                          title="Delete User"
                        >
                          {deleteLoading === u._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. PREDICTIONS DATABASE PANEL */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-16 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-nature-500" />
              </div>
            ) : predictions.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                No logs stored in database yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Suggested Crop</th>
                      <th className="px-6 py-4">NPK</th>
                      <th className="px-6 py-4">Soil pH</th>
                      <th className="px-6 py-4">Confidence</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/10">
                    {predictions.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/25 transition-colors">
                        <td className="px-6 py-4">
                          {p.userId ? (
                            <div>
                              <span className="font-semibold text-white block">{p.userId.username}</span>
                              <span className="text-[10px] text-slate-500 block leading-tight">{p.userId.email}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-xs">Guest User</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">{formatCropName(p.predictedCrop)}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-450">{p.inputs.N}-{p.inputs.P}-{p.inputs.K}</td>
                        <td className="px-6 py-4 font-mono text-slate-450">{p.inputs.ph.toFixed(1)}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-nature-500/10 text-nature-400">
                            {(p.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeletePrediction(p._id)}
                            disabled={deleteLoading === p._id}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Delete Record"
                          >
                            {deleteLoading === p._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4.5 w-4.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paginated Navigation for Database logs */}
          {predPagination.pages > 1 && !loading && (
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setPredPage(prev => Math.max(prev - 1, 1))}
                disabled={predPage === 1}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                Prev
              </button>
              <span className="text-xs text-slate-400 flex items-center font-medium">
                Page {predPage} of {predPagination.pages}
              </span>
              <button
                onClick={() => setPredPage(prev => Math.min(prev + 1, predPagination.pages))}
                disabled={predPage === predPagination.pages}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;

import React, { useState, useEffect } from 'react';
import GoogleDriveSyncPanel from '../components/admin/GoogleDriveSyncPanel';
import { Shield, Check, X, Eye, Users, Download, Database, Layers, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const AdminDashboard = () => {
  const [moderationQueue, setModerationQueue] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [queueRes, analyticsRes] = await Promise.all([
        api.get('/admin/moderation/queue'),
        api.get('/admin/analytics'),
      ]);
      setModerationQueue(queueRes.data.icons || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.warn('Could not load admin stats', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleModerate = async (id, status) => {
    try {
      await api.put(`/admin/moderation/icon/${id}`, { status });
      addToast(`Submission ${status}!`, 'success');
      setModerationQueue((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      addToast('Moderation Error: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="pb-6 border-b border-subpage-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-subpage-primary text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-landing-vibrant-coral" />
            <span>Master Control Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-subpage-on-surface tracking-tight">
            Admin Portal & Asset Management
          </h1>
          <p className="text-xs text-subpage-on-surface-variant mt-1">
            Google Drive synchronization, content moderation queue, and system analytics.
          </p>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl glass-subpage bg-white/90 border border-white/80 shadow-glass">
          <span className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
            Total Icons Ingested
          </span>
          <span className="text-3xl font-extrabold font-heading text-subpage-primary">
            {analytics?.totalIcons || '50,420'}
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-subpage bg-white/90 border border-white/80 shadow-glass">
          <span className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
            Total Downloads
          </span>
          <span className="text-3xl font-extrabold font-heading text-landing-vibrant-coral">
            {analytics?.totalDownloads || '142,890'}
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-subpage bg-white/90 border border-white/80 shadow-glass">
          <span className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
            Active Pro Subscribers
          </span>
          <span className="text-3xl font-extrabold font-heading text-emerald-600">
            {analytics?.activeSubscriptions || '380'}
          </span>
        </div>

        <div className="p-6 rounded-3xl glass-subpage bg-white/90 border border-white/80 shadow-glass">
          <span className="text-xs font-bold uppercase tracking-wider text-subpage-on-surface-variant block mb-1">
            Estimated Monthly Revenue
          </span>
          <span className="text-3xl font-extrabold font-heading text-indigo-600">
            ₹{analytics?.estimatedRevenueINR || '37,620'}
          </span>
        </div>
      </div>

      {/* 1. Google Drive Sync Panel */}
      <GoogleDriveSyncPanel />

      {/* 2. Moderation Queue */}
      <div className="p-6 sm:p-8 rounded-4xl glass-subpage bg-white/90 border border-white/80 shadow-glass">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-landing-surface-container">
          <h2 className="font-heading font-extrabold text-xl text-subpage-primary flex items-center gap-2">
            <Layers className="w-5 h-5 text-landing-vibrant-coral" />
            <span>Pending Asset Submissions ({moderationQueue.length})</span>
          </h2>
        </div>

        {moderationQueue.length === 0 ? (
          <div className="text-center py-12 text-subpage-on-surface-variant">
            <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold">Moderation queue is clean. No pending uploads!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {moderationQueue.map((item) => (
              <div
                key={item._id}
                className="p-5 rounded-3xl bg-white border border-subpage-surface-container shadow-sm flex flex-col justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl bg-subpage-surface-container-low flex items-center justify-center p-2 shrink-0 text-subpage-primary [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: item.svgContent }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-subpage-on-surface">{item.title}</h4>
                    <span className="text-xs text-subpage-on-surface-variant block capitalize">
                      {item.style} • {item.categoryId?.name || 'Category'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-subpage-surface-container">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleModerate(item._id, 'approved')}
                    icon={Check}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleModerate(item._id, 'rejected')}
                    icon={X}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

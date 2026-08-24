import React, { useState, useEffect } from 'react';
import { Cloud, RefreshCw, CheckCircle2, AlertCircle, Folder, FileCheck, Layers } from 'lucide-react';
import Button from '../common/Button';
import { driveService } from '../../services/driveService';
import { useToast } from '../../context/ToastContext';

const GoogleDriveSyncPanel = () => {
  const [folderId, setFolderId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const { addToast } = useToast();

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await driveService.getStatus();
      setStatusData(res.data);
      if (res.data.configuredFolderId) {
        setFolderId(res.data.configuredFolderId);
      }
    } catch (err) {
      console.warn('Could not load drive status', err.message);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await driveService.triggerSync(folderId || undefined);
      addToast(res.message || 'Google Drive sync completed!', 'success');
      await loadStatus();
    } catch (err) {
      addToast('Sync Error: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePreview = async () => {
    try {
      const res = await driveService.previewFolder(folderId || undefined);
      setPreviewFiles(res.data.files || []);
      addToast(`Found ${res.data.files?.length || 0} files in Google Drive folder`, 'info');
    } catch (err) {
      addToast('Preview Error: ' + err.message, 'error');
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-4xl glass-subpage bg-white/90 border border-white/80 shadow-glass flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-landing-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-energy-gradient p-0.5 flex items-center justify-center shadow-coral">
            <div className="w-full h-full bg-[#001e52] rounded-[14px] flex items-center justify-center">
              <Cloud className="w-6 h-6 text-landing-electric-teal" />
            </div>
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl text-landing-primary">
              Google Drive Asset Ingestion & Sync
            </h3>
            <p className="text-xs text-landing-on-surface-variant">
              Synchronize, extract SVG metadata, and load icons directly from Google Drive.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              statusData?.hasServiceAccount
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {statusData?.hasServiceAccount ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Service Account Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Dev / Mock Drive Mode</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Sync Control Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-8 flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-landing-primary" />
            <span>Google Drive Folder ID</span>
          </label>
          <input
            type="text"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            placeholder="e.g. 1a2b3c4d5e6f7g8h9i0_folder_id"
            className="w-full bg-landing-surface-container-low px-4 py-3 rounded-2xl text-sm font-mono border border-landing-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-landing-primary"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Button
            variant="glass"
            size="md"
            onClick={handlePreview}
            className="flex-1"
          >
            Scan & Preview
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleSync}
            isLoading={isSyncing}
            icon={RefreshCw}
            className="flex-1"
          >
            Sync Now
          </Button>
        </div>
      </div>

      {/* Preview File List */}
      {previewFiles.length > 0 && (
        <div className="p-4 rounded-3xl bg-landing-surface-container-low border border-landing-surface-container">
          <h4 className="text-xs font-bold uppercase tracking-wider text-landing-primary mb-3 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-landing-vibrant-coral" />
            <span>Discovered Assets ({previewFiles.length})</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {previewFiles.map((file) => (
              <div key={file.id} className="p-2 rounded-xl bg-white text-xs truncate border border-landing-surface-container flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync History Logs */}
      {statusData?.logs && statusData.logs.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-landing-on-surface-variant mb-3">
            Recent Synchronization History
          </h4>
          <div className="flex flex-col gap-2">
            {statusData.logs.slice(0, 4).map((log) => (
              <div
                key={log._id}
                className="p-3.5 rounded-2xl bg-white border border-landing-surface-container flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      log.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-landing-on-surface">Folder: {log.folderId}</span>
                    <span className="text-[11px] text-landing-on-surface-variant block">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <span className="text-emerald-700">+{log.iconsIngested} new</span>
                  <span className="text-indigo-700">~{log.iconsUpdated} updated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveSyncPanel;

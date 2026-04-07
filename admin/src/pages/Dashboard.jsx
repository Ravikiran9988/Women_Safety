import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Bell, RotateCw, Shield, CheckCircle, Activity } from 'lucide-react';
import { MapView } from '../components/MapView';
import { SOSList } from '../components/SOSList';
import { DetailsPanel } from '../components/DetailsPanel';
import { sosAPI } from '../services/api';

export const Dashboard = () => {
  const [sosList, setSosList] = useState([]);
  const sosListRef = useRef([]);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [trackingPoints, setTrackingPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [analyticsData, setAnalyticsData] = useState({ total: 0, active: 0, resolved: 0 });
  const [notificationSound, setNotificationSound] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const initialLoadRef = useRef(true);

  const fetchActiveSOS = useCallback(async () => {
    try {
      if (initialLoadRef.current) {
        setLoading(true);
      }
      setError(null);
      const response = await sosAPI.getActiveSOS();

      if (response.ok) {
        const newSOSes = response.data || [];

        if (sosListRef.current.length > 0 && newSOSes.length > sosListRef.current.length) {
          setNotificationSound(true);
          playNotificationSound();
          setTimeout(() => setNotificationSound(false), 3000);
        }

        setSosList(newSOSes);
        sosListRef.current = newSOSes;
        setLastUpdated(new Date());
        setAnalyticsData({
          total: newSOSes.length,
          active: newSOSes.filter((s) => (s.status || 'active') === 'active').length,
          resolved: newSOSes.filter((s) => s.status === 'resolved').length,
        });
        if (initialLoadRef.current) {
          initialLoadRef.current = false;
        }
      } else {
        setError(response.error || 'Server returned an unexpected response.');
      }
    } catch (err) {
      console.error('Error fetching SOS:', err);
      setError('Failed to fetch SOS alerts. Check server connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTracking = useCallback(async (sosId) => {
    try {
      const response = await sosAPI.getTracking(sosId);
      if (response.ok) setTrackingPoints(response.data || []);
    } catch (err) {
      console.error('Error fetching tracking:', err);
    }
  }, []);

  useEffect(() => {
    fetchActiveSOS();
    const interval = setInterval(fetchActiveSOS, 3000);
    return () => clearInterval(interval);
  }, [fetchActiveSOS]);

  useEffect(() => {
    if (selectedSOS?._id) fetchTracking(selectedSOS._id);
  }, [selectedSOS, fetchTracking]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
  };

  const handleSelectSOS = (sos) => {
    setSelectedSOS(sos);
    fetchTracking(sos._id);
  };

  const handleResolveSOS = async () => {
    if (!selectedSOS) return;
    try {
      setResolving(true);
      const response = await sosAPI.resolveSOS(selectedSOS._id);
      if (response.ok) {
        setSosList((prev) =>
          prev.map((s) =>
            s._id === selectedSOS._id
              ? { ...s, status: 'resolved', resolvedAt: new Date().toISOString() }
              : s
          )
        );
        setSelectedSOS((prev) => ({ ...prev, status: 'resolved', resolvedAt: new Date().toISOString() }));
      }
    } catch (err) {
      console.error('Error resolving SOS:', err);
    } finally {
      setResolving(false);
    }
  };

  const handleAssignResponder = async (type) => {
    if (!selectedSOS) return;
    try {
      setAssigning(true);
      const responderName =
        type === 'police'
          ? 'Police Unit-' + Math.floor(Math.random() * 1000)
          : 'Ambulance-' + Math.floor(Math.random() * 1000);
      const response = await sosAPI.assignSOS(selectedSOS._id, type, { responderName });
      if (response.ok) {
        setSosList((prev) =>
          prev.map((s) =>
            s._id === selectedSOS._id
              ? { ...s, status: 'assigned', assignedResponder: responderName, assignedTime: new Date().toISOString() }
              : s
          )
        );
        setSelectedSOS((prev) => ({
          ...prev,
          status: 'assigned',
          assignedResponder: responderName,
          assignedTime: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error('Error assigning responder:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchActiveSOS();
    } finally {
      setRefreshing(false);
    }
  };

  const stats = [
    {
      label: 'Total SOS',
      value: analyticsData.total,
      sub: 'All alerts in system',
      icon: Shield,
      color: 'blue',
      border: 'border-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-gray-900',
    },
    {
      label: 'Active SOS',
      value: analyticsData.active,
      sub: 'Needs immediate attention',
      icon: AlertTriangle,
      color: 'red',
      border: 'border-red-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      pulse: analyticsData.active > 0,
    },
    {
      label: 'Resolved SOS',
      value: analyticsData.resolved,
      sub: 'Completed incidents',
      icon: CheckCircle,
      color: 'green',
      border: 'border-green-500',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
    },
  ];

  return (
    <div className="min-h-full bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              SOS Tracking Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real-time emergency response management
              {lastUpdated && (
                <span className="ml-2 text-xs text-gray-400">
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-white rounded-xl shadow-sm border-l-4 ${stat.border} p-5 flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className={`text-3xl font-bold mt-0.5 ${stat.valueColor} ${stat.pulse ? 'animate-pulse' : ''}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">{error}</p>
              <p className="text-xs text-red-600 mt-0.5">Check your connection and try again</p>
            </div>
          </div>
        )}

        {/* Main 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* SOS List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
            <SOSList
              sosList={sosList}
              selectedSOS={selectedSOS}
              onSelectSOS={handleSelectSOS}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              loading={loading}
            />
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '580px' }}>
            <MapView
              sosList={sosList}
              selectedSOS={selectedSOS}
              trackingPoints={trackingPoints}
              loading={loading}
            />
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '580px' }}>
            <DetailsPanel
              selectedSOS={selectedSOS}
              loading={loading}
              onResolve={handleResolveSOS}
              onAssign={handleAssignResponder}
              resolving={resolving}
              assigning={assigning}
              onClose={() => setSelectedSOS(null)}
            />
          </div>

        </div>
      </div>

      {/* New SOS Notification Toast */}
      {notificationSound && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <Bell className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">New SOS Alert!</p>
            <p className="text-xs text-red-100">Immediate attention required</p>
          </div>
        </div>
      )}
    </div>
  );
};

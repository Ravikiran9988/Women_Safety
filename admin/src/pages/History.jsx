import React, { useState, useEffect } from 'react';
import { History, MapPin, Clock, Download, Filter, Search } from 'lucide-react';
import { sosAPI } from '../services/api';

export const HistoryPage = () => {
  const [allSOSes, setAllSOSes] = useState([]);
  const [filteredSOSes, setFilteredSOSes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedSOS, setSelectedSOS] = useState(null);

  // Fetch all SOS records (in a real app, you'd have a dedicated endpoint)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await sosAPI.getActiveSOS();
        if (response.ok) {
          const allSOSData = response.data || [];
          // Filter resolved ones
          const resolved = allSOSData.filter((s) => s.status === 'resolved');
          setAllSOSes(resolved);
          setFilteredSOSes(resolved);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Refresh every 5 seconds
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = allSOSes;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (sos) =>
          sos._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (sos.profile?.phone || sos.profile?.phoneNumber)?.includes(searchQuery)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(
        (sos) => new Date(sos.createdAt) >= filterDate
      );
    }

    setFilteredSOSes(filtered);
  }, [searchQuery, dateFilter, allSOSes]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'SOS ID',
      'Phone',
      'Mode',
      'Status',
      'Created At',
      'Resolved At',
      'Assigned To',
      'Latitude',
      'Longitude',
    ];

    const rows = filteredSOSes.map((sos) => [
      sos._id,
      sos.profile?.phone || sos.profile?.phoneNumber || 'N/A',
      sos.mode || 'N/A',
      sos.status || 'N/A',
      new Date(sos.createdAt).toLocaleString(),
      sos.resolvedAt ? new Date(sos.resolvedAt).toLocaleString() : 'N/A',
      sos.assignedResponder || 'N/A',
      sos.initialLocation?.latitude || 'N/A',
      sos.initialLocation?.longitude || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sos-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <History className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SOS History</h1>
                <p className="text-sm text-gray-600">Resolved emergency incidents</p>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by SOS ID or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm appearance-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
              </select>
            </div>

            {/* Stats */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold">Total Resolved</p>
              <p className="text-2xl font-bold text-blue-900">{filteredSOSes.length}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading history...</p>
            </div>
          ) : filteredSOSes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No resolved SOS alerts found</p>
              <p className="text-sm">Resolved incidents will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">SOS ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Mode</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Alert Time</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Assigned To</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSOSes.map((sos) => (
                    <tr
                      key={sos._id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedSOS(sos)}
                    >
                      <td className="px-6 py-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {sos._id.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-900">
                        {sos.profile?.phone || sos.profile?.phoneNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {sos.mode === 'guest' ? '👤 Guest' : '👥 User'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {sos.initialLocation ? (
                          <button
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            title={`${sos.initialLocation.latitude}, ${sos.initialLocation.longitude}`}
                          >
                            <MapPin className="w-4 h-4" />
                            View
                          </button>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(sos.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sos.assignedResponder ? (
                          <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold">
                            {sos.assignedResponder}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSOS(sos);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSOS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">SOS Details</h2>
              <button
                onClick={() => setSelectedSOS(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">SOS ID</p>
                <code className="text-sm font-mono">{selectedSOS._id}</code>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">Phone</p>
                <p className="text-sm font-mono">{selectedSOS.profile?.phone || selectedSOS.profile?.phoneNumber || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">Mode</p>
                <p className="text-sm">{selectedSOS.mode === 'guest' ? '👤 Guest' : '👥 User'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-1">Status</p>
                <p className="text-sm font-semibold text-green-600">✅ {selectedSOS.status || 'Resolved'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                <p className="text-xs text-gray-600 font-semibold mb-1">Alert Time</p>
                <p className="text-sm">{new Date(selectedSOS.createdAt).toLocaleString()}</p>
              </div>

              {selectedSOS.resolvedAt && (
                <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Resolved At</p>
                  <p className="text-sm">{new Date(selectedSOS.resolvedAt).toLocaleString()}</p>
                </div>
              )}

              {selectedSOS.initialLocation && (
                <div className="p-4 bg-blue-50 rounded-lg col-span-2 border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold mb-2">Location</p>
                  <p className="text-sm">
                    <strong>Latitude:</strong> {selectedSOS.initialLocation.latitude.toFixed(6)}
                  </p>
                  <p className="text-sm">
                    <strong>Longitude:</strong> {selectedSOS.initialLocation.longitude.toFixed(6)}
                  </p>
                  {selectedSOS.initialLocation.accuracy && (
                    <p className="text-sm">
                      <strong>Accuracy:</strong> ±{selectedSOS.initialLocation.accuracy.toFixed(0)}m
                    </p>
                  )}
                </div>
              )}

              {selectedSOS.assignedResponder && (
                <div className="p-4 bg-purple-50 rounded-lg col-span-2 border border-purple-200">
                  <p className="text-xs text-purple-600 font-semibold mb-1">Assigned To</p>
                  <p className="text-sm">{selectedSOS.assignedResponder}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSOS(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

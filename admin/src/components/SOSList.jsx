import React, { useState } from 'react';
import {
  AlertTriangle, Clock, MapPin, Phone,
  Search, Filter, User, UserCheck,
} from 'lucide-react';

export const SOSList = ({
  sosList = [],
  selectedSOS,
  onSelectSOS,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  loading,
}) => {
  const [sortBy, setSortBy] = useState('newest');

  const filteredSOSes = sosList
    .filter((sos) => {
      const matchesSearch =
        !searchQuery ||
        sos._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sos.profile?.phone || sos.profile?.phoneNumber)?.includes(searchQuery);
      const matchesStatus =
        filterStatus === 'all' ||
        (sos.status || 'active') === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) =>
      sortBy === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const getStatusStyle = (status) => {
    switch (status || 'active') {
      case 'active':   return 'text-red-600 bg-red-50 border border-red-200';
      case 'assigned': return 'text-yellow-700 bg-yellow-50 border border-yellow-200';
      case 'resolved': return 'text-green-700 bg-green-50 border border-green-200';
      default:         return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status || 'active') {
      case 'active':   return '🔴 Active';
      case 'assigned': return '🟡 Assigned';
      case 'resolved': return '✅ Resolved';
      default:         return '⚪ Unknown';
    }
  };

  const counts = {
    active:   sosList.filter(s => (s.status || 'active') === 'active').length,
    assigned: sosList.filter(s => s.status === 'assigned').length,
    resolved: sosList.filter(s => s.status === 'resolved').length,
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">

      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-bold text-gray-800">Active SOS Alerts</h2>
          <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {filteredSOSes.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by SOS ID or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-400 outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-red-400 outline-none bg-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && sosList.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading SOS alerts...</p>
          </div>
        ) : filteredSOSes.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">No alerts found</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'Try a different search' : 'Waiting for emergency calls...'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSOSes.map((sos) => {
              const isActive = (sos.status || 'active') === 'active';
              const isSelected = selectedSOS?._id === sos._id;

              return (
                // ✅ Added 'relative' so the pulse dot positions correctly
                <button
                  key={sos._id}
                  onClick={() => onSelectSOS(sos)}
                  className={`relative w-full text-left p-4 transition-all ${
                    isSelected
                      ? 'bg-red-50 border-l-4 border-red-500'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  {/* ✅ Pulse dot — fixed with relative parent */}
                  {isActive && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}

                  {/* ID + Status */}
                  <div className="flex items-center justify-between mb-2 pr-4">
                    <p className="font-mono text-xs font-bold text-gray-800">
                      #{sos._id.slice(-8).toUpperCase()}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(sos.status)}`}>
                      {getStatusLabel(sos.status)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="font-mono">{sos.profile?.phone || sos.profile?.phoneNumber || 'No phone'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {sos.mode === 'guest'
                        ? <><User className="w-3 h-3 text-gray-400 flex-shrink-0" /><span>Guest User</span></>
                        : <><UserCheck className="w-3 h-3 text-gray-400 flex-shrink-0" /><span>Registered User</span></>
                      }
                    </div>

                    {sos.initialLocation && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span>
                          {sos.initialLocation.latitude.toFixed(4)}, {sos.initialLocation.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{new Date(sos.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Assigned responder tag */}
                  {sos.assignedResponder && (
                    <div className="mt-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                      👮 {sos.assignedResponder}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex justify-around text-center">
        <div>
          <p className="text-sm font-bold text-red-600">{counts.active}</p>
          <p className="text-xs text-gray-400">Active</p>
        </div>
        <div className="border-l border-gray-200" />
        <div>
          <p className="text-sm font-bold text-yellow-600">{counts.assigned}</p>
          <p className="text-xs text-gray-400">Assigned</p>
        </div>
        <div className="border-l border-gray-200" />
        <div>
          <p className="text-sm font-bold text-green-600">{counts.resolved}</p>
          <p className="text-xs text-gray-400">Resolved</p>
        </div>
      </div>
    </div>
  );
};

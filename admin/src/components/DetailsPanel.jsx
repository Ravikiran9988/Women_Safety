import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  Clock,
  User,
  Loader,
  X,
} from 'lucide-react';

export const DetailsPanel = ({
  selectedSOS,
  loading,
  onResolve,
  onAssign,
  resolving,
  assigning,
  onClose,
}) => {
  const [assignMode, setAssignMode] = useState(null);

  if (!selectedSOS) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium">No SOS selected</p>
        <p className="text-gray-500 text-sm">Click on an SOS alert to view details</p>
      </div>
    );
  }

  const handleAssignClick = async (type) => {
    if (window.confirm(`Assign ${type === 'police' ? 'Police' : 'Ambulance'} to this SOS?`)) {
      await onAssign(type);
      setAssignMode(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">SOS Details</h3>
          <p className="text-xs text-gray-500 mt-1">ID: {selectedSOS._id}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600">Loading details...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              selectedSOS.status === 'resolved'
                ? 'bg-green-50 border border-green-200'
                : selectedSOS.status === 'assigned'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200 animate-pulse'
            }`}>
              {selectedSOS.status === 'resolved' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : selectedSOS.status === 'assigned' ? (
                <Truck className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="font-semibold text-gray-900">
                Status: {selectedSOS.status ? selectedSOS.status.charAt(0).toUpperCase() + selectedSOS.status.slice(1) : 'Active'}
              </span>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Phone */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-600 font-medium">Phone</p>
                </div>
                <p className="text-sm font-mono font-semibold text-gray-900">
                  {selectedSOS.profile?.phone || selectedSOS.profile?.phoneNumber || 'N/A'}
                </p>
              </div>

              {/* Mode */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-600 font-medium">Mode</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedSOS.mode === 'guest' ? '👤 Guest' : '👥 User'}
                </p>
              </div>

              {/* Created Time */}
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-600 font-medium">Alert Time</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(selectedSOS.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Location Section */}
            {selectedSOS.initialLocation && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 font-medium">Location</p>
                    <div className="mt-2 text-xs font-mono text-blue-900 space-y-1">
                      <p>Latitude: {selectedSOS.initialLocation.latitude.toFixed(6)}</p>
                      <p>Longitude: {selectedSOS.initialLocation.longitude.toFixed(6)}</p>
                      {selectedSOS.initialLocation.accuracy && (
                        <p>Accuracy: ±{selectedSOS.initialLocation.accuracy.toFixed(0)}m</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assigned Responder */}
            {selectedSOS.assignedResponder && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-medium mb-1">Assigned Responder</p>
                <p className="text-sm font-semibold text-purple-900">
                  {selectedSOS.assignedResponder}
                </p>
                {selectedSOS.assignedTime && (
                  <p className="text-xs text-purple-600 mt-1">
                    {new Date(selectedSOS.assignedTime).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Resolved At */}
            {selectedSOS.status === 'resolved' && selectedSOS.resolvedAt && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 font-medium mb-1">Resolved At</p>
                <p className="text-sm font-semibold text-green-900">
                  {new Date(selectedSOS.resolvedAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* User Profile (if available) */}
            {selectedSOS.profile && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 font-medium mb-2">User Profile</p>
                <div className="text-sm space-y-1">
                  {selectedSOS.profile.name && (
                    <p><span className="text-gray-600">Name:</span> {selectedSOS.profile.name}</p>
                  )}
                  {selectedSOS.profile.email && (
                    <p><span className="text-gray-600">Email:</span> {selectedSOS.profile.email}</p>
                  )}
                  {selectedSOS.profile.emergencyContacts && (
                    <p><span className="text-gray-600">Emergency Contacts:</span> {selectedSOS.profile.emergencyContacts}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedSOS.status !== 'resolved' && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
          {/* Assign Buttons */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              Assign Responder:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAssignClick('police')}
                disabled={assigning || selectedSOS.status === 'resolved'}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-3 rounded-lg transition"
              >
                {assigning ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
                Police
              </button>
              <button
                onClick={() => handleAssignClick('ambulance')}
                disabled={assigning || selectedSOS.status === 'resolved'}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-medium py-2 px-3 rounded-lg transition"
              >
                {assigning ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
                Ambulance
              </button>
            </div>
          </div>

          {/* Resolve Button */}
          <button
            onClick={onResolve}
            disabled={resolving || selectedSOS.status === 'resolved'}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {resolving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Resolve SOS
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Once resolved, this SOS will be moved to history
          </p>
        </div>
      )}
    </div>
  );
};

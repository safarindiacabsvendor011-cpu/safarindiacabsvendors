import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  FileText, 
  Phone, 
  Car, 
  X,
  UploadCloud,
  Award
} from 'lucide-react';
import { Driver, Cab, UserProfile, VerificationStatus } from '../types';

interface VendorDriverManagerProps {
  drivers: Driver[];
  cabs: Cab[];
  currentUser: UserProfile;
  onAddDriver: (driver: Driver) => void;
  onDeleteDriver: (driverId: string) => void;
  onUpdateDriver: (driver: Driver) => void;
}

export const VendorDriverManager: React.FC<VendorDriverManagerProps> = ({
  drivers,
  cabs,
  currentUser,
  onAddDriver,
  onDeleteDriver,
  onUpdateDriver
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [assignedCabId, setAssignedCabId] = useState('');
  const [dlDocumentUrl, setDlDocumentUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80');

  // Filter vendor's drivers and cabs
  const myDrivers = drivers.filter(d => d.vendorId === currentUser.id);
  const myCabs = cabs.filter(c => c.vendorId === currentUser.id);

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !licenseNumber.trim()) return;

    const matchedCab = myCabs.find(c => c.id === assignedCabId);

    const newDriver: Driver = {
      id: `drv-${Date.now()}`,
      vendorId: currentUser.id,
      vendorName: currentUser.name,
      vendorCompany: currentUser.companyName,
      name: name.trim(),
      phone: phone.trim(),
      licenseNumber: licenseNumber.toUpperCase().trim(),
      dlDocument: dlDocumentUrl,
      experienceYears: Number(experienceYears),
      assignedCabId: assignedCabId || undefined,
      assignedCabNumber: matchedCab?.vehicleNumber,
      status: 'pending', // Starts as pending for Super Admin approval
      isActive: true,
      addedAt: 'Just now'
    };

    onAddDriver(newDriver);
    setIsAddModalOpen(false);

    // Reset
    setName('');
    setPhone('');
    setLicenseNumber('');
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            DL Verified by Admin
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            Verification Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            Under DL Verification
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Driver Roster & Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add full-time or on-demand commercial drivers. Super Admin validates Driving License credentials before trip assignment.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Driver
        </button>
      </div>

      {/* Driver Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Registered</p>
          <p className="text-xl font-black text-slate-900 mt-1">{myDrivers.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Verified Active</p>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {myDrivers.filter(d => d.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Under Verification</p>
          <p className="text-xl font-black text-amber-600 mt-1">
            {myDrivers.filter(d => d.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Assigned to Cabs</p>
          <p className="text-xl font-black text-blue-600 mt-1">
            {myDrivers.filter(d => d.assignedCabId).length}
          </p>
        </div>
      </div>

      {/* Drivers List */}
      {myDrivers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Drivers Enrolled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Register your verified commercial drivers with driving license numbers to assign them to outstation duties.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700"
          >
            Add First Driver
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myDrivers.map((driver) => (
            <div 
              key={driver.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {driver.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{driver.phone}</span>
                    </div>
                  </div>
                  {getStatusBadge(driver.status)}
                </div>

                {/* DL Badge */}
                <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">DL Number:</span>
                    <span className="font-mono font-bold text-slate-800">{driver.licenseNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Experience:</span>
                    <span className="font-semibold text-slate-700">{driver.experienceYears || 5} Years Commercial</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Assigned Vehicle:</span>
                    <span className="font-bold text-blue-700">
                      {driver.assignedCabNumber || 'Unassigned / Standby'}
                    </span>
                  </div>
                </div>

                {driver.rejectionReason && driver.status === 'rejected' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <span className="font-bold">Super Admin Note: </span>
                    {driver.rejectionReason}
                  </div>
                )}
              </div>

              {/* Document actions & Delete */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedDocPreview({ title: `Driving License: ${driver.name}`, url: driver.dlDocument })}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View DL Document
                </button>

                <button
                  onClick={() => onDeleteDriver(driver.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  title="Remove driver"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-base">Add New Driver to Roster</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Driver Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98112 34567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commercial Driving License (DL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-0420180029381"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full uppercase font-mono px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commercial Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Approved Vehicle (Optional)
                </label>
                <select
                  value={assignedCabId}
                  onChange={(e) => setAssignedCabId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                >
                  <option value="">No Vehicle Assigned (Standby)</option>
                  {myCabs.map(cab => (
                    <option key={cab.id} value={cab.id}>
                      {cab.vehicleNumber} - {cab.model} ({cab.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload DL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driving License (DL) Scanned Copy / Photo *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Commercial DL Photo Uploaded</p>
                  <p className="text-[11px] text-slate-500">Government issued transport category license</p>
                  <span className="inline-block mt-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                    driver_dl_commercial.jpg
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Submit for Super Admin Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                {selectedDocPreview.title}
              </h4>
              <button 
                onClick={() => setSelectedDocPreview(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100">
              <img 
                src={selectedDocPreview.url} 
                alt="Document Preview"
                className="w-full h-64 object-cover rounded-lg border border-slate-300 shadow-inner"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Government Commercial License Specimen</span>
                <span className="font-semibold text-emerald-600">Verified Format</span>
              </div>
            </div>
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

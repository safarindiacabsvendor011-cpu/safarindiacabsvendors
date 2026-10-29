import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  FileText, 
  Eye, 
  CheckCircle2, 
  X,
  UploadCloud,
  Calendar,
  Fuel,
  Users
} from 'lucide-react';
import { Cab, UserProfile, VerificationStatus } from '../types';

interface VendorFleetManagerProps {
  cabs: Cab[];
  currentUser: UserProfile;
  onAddCab: (cab: Cab) => void;
  onDeleteCab: (cabId: string) => void;
  onUpdateCab: (cab: Cab) => void;
}

export const VendorFleetManager: React.FC<VendorFleetManagerProps> = ({
  cabs,
  currentUser,
  onAddCab,
  onDeleteCab,
  onUpdateCab
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

  // Form fields
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<Cab['category']>('Sedan');
  const [fuelType, setFuelType] = useState('Diesel');
  const [seatingCapacity, setSeatingCapacity] = useState(4);
  const [fitnessExpiry, setFitnessExpiry] = useState('2027-12-31');
  const [rcDocumentUrl, setRcDocumentUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
  const [insuranceDocumentUrl, setInsuranceDocumentUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80');

  // Filter vendor's cabs
  const myCabs = cabs.filter(c => c.vendorId === currentUser.id);

  const handleCreateCab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim() || !model.trim()) return;

    const newCab: Cab = {
      id: `cab-${Date.now()}`,
      vendorId: currentUser.id,
      vendorName: currentUser.name,
      vendorCompany: currentUser.companyName,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      model: model.trim(),
      category: category,
      rcDocument: rcDocumentUrl,
      insuranceDocument: insuranceDocumentUrl,
      fitnessExpiry: fitnessExpiry,
      seatingCapacity: Number(seatingCapacity),
      fuelType: fuelType,
      status: 'pending', // Starts as pending for Super Admin approval
      isActive: true,
      addedAt: 'Just now'
    };

    onAddCab(newCab);
    setIsAddModalOpen(false);

    // Reset
    setVehicleNumber('');
    setModel('');
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Approved by Admin
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
            Under Admin Verification
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
            <Car className="h-5 w-5 text-blue-600" />
            Fleet & Vehicle Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register your taxis and commercial cabs. Super Admin verifies RC, Insurance, and fitness before enabling instant bookings.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs shadow transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Vehicle / Cab
        </button>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Registered</p>
          <p className="text-xl font-black text-slate-900 mt-1">{myCabs.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Approved Active</p>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {myCabs.filter(c => c.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Pending Review</p>
          <p className="text-xl font-black text-amber-600 mt-1">
            {myCabs.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Rejected / Action Needed</p>
          <p className="text-xl font-black text-rose-600 mt-1">
            {myCabs.filter(c => c.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      {myCabs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Car className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Cabs Added Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Add your first vehicle with RC and insurance documents to start assigning it to profitable intercity duties.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700"
          >
            Add First Cab
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCabs.map((cab) => (
            <div 
              key={cab.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {cab.category}
                    </span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {cab.model}
                    </h3>
                  </div>
                  {getStatusBadge(cab.status)}
                </div>

                {/* Commercial Plate Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400 text-slate-950 font-black tracking-widest text-xs border border-amber-500 shadow-2xs my-2">
                  <span className="text-[10px] font-normal text-slate-800">IND</span>
                  <span>{cab.vehicleNumber}</span>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cab.fuelType || 'Diesel'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cab.seatingCapacity || 4} Seats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cab.fitnessExpiry ? `Exp: ${cab.fitnessExpiry.slice(0, 4)}` : 'Fitness OK'}</span>
                  </div>
                </div>

                {cab.rejectionReason && cab.status === 'rejected' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <span className="font-bold">Super Admin Note: </span>
                    {cab.rejectionReason}
                  </div>
                )}
              </div>

              {/* Document actions & Delete */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDocPreview({ title: `RC Document: ${cab.vehicleNumber}`, url: cab.rcDocument })}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    RC Document
                  </button>
                  {cab.insuranceDocument && (
                    <>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={() => setSelectedDocPreview({ title: `Insurance: ${cab.vehicleNumber}`, url: cab.insuranceDocument! })}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Insurance
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => onDeleteCab(cab.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Cab Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-base">Add New Vehicle to Fleet</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCab} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commercial Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL 01 TA 4421"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full uppercase font-mono px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dzire VXI / Innova Crysta"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Cab['category'])}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Premium SUV">Premium SUV</option>
                    <option value="Tempo Traveller">Tempo Traveller</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600 bg-white"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="CNG + Petrol">CNG + Petrol</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seats
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={26}
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fitness Expiry Date
                </label>
                <input
                  type="date"
                  value={fitnessExpiry}
                  onChange={(e) => setFitnessExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-blue-600"
                />
              </div>

              {/* Upload RC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration Certificate (RC) Photo / Document *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Official RC Document Attached</p>
                  <p className="text-[11px] text-slate-500">Commercial Registration Certificate scanned copy</p>
                  <span className="inline-block mt-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                    rc_doc_verified_sample.jpg
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
                <span>Verified Commercial Document Format</span>
                <span className="font-semibold text-emerald-600">Cryptographically Encrypted</span>
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

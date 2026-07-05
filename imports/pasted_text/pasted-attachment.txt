"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Users,
  Trash2,
  Edit,
  Plus,
  X,
} from "lucide-react";
import { Progress } from "../../components/ui/progress";
import { AddCenterDialog } from "../../components/AddCenterDialog";

interface Center {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentLoad: number;
  status: "active" | "inactive" | "maintenance";
  manager: string;
  contact: string;
}

export default function Centers() {
  const [centers, setCenters] = useState<Center[]>([
    {
      id: "1",
      name: "Downtown Center",
      location: "123 Main St, City Center",
      capacity: 5000,
      currentLoad: 3200,
      status: "active",
      manager: "John Doe",
      contact: "+1 234-567-8900",
    },
    {
      id: "2",
      name: "North District Center",
      location: "456 North Ave",
      capacity: 3000,
      currentLoad: 2800,
      status: "active",
      manager: "Jane Smith",
      contact: "+1 234-567-8901",
    },
    {
      id: "3",
      name: "East Side Center",
      location: "789 East Blvd",
      capacity: 4000,
      currentLoad: 1500,
      status: "maintenance",
      manager: "Bob Johnson",
      contact: "+1 234-567-8902",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);

  const handleAddCenter = (newCenter: any) => {
    const withId: Center = {
      ...newCenter,
      id: newCenter.id ?? `CEN-${Date.now()}`,
    };
    setCenters([...centers, withId]);
  };

  const handleSaveEdit = (updated: Center) => {
    setCenters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCenter(null);
  };

  const deleteCenter = (id: string) => {
    const c = centers.find((x) => x.id === id);
    if (window.confirm(`Delete center "${c?.name ?? id}"?`)) {
      setCenters(centers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Collection Centers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage recycling collection centers
          </p>
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Center
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Total Centers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {centers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Active Centers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  centers.filter((c) => c.status === "active")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Total Capacity
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {centers
                  .reduce((acc, c) => acc + c.capacity, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Center Dialog */}
      <AddCenterDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddCenter}
      />

      {/* Centers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Center Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Load
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {centers.map((center) => (
                <tr
                  key={center.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {center.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{center.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {center.capacity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {center.currentLoad.toLocaleString()}
                      </div>
                      <Progress
                        value={
                          (center.currentLoad / center.capacity) * 100
                        }
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        center.status === "active"
                          ? "bg-green-100 text-green-700"
                          : center.status === "inactive"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {center.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {center.manager}
                      </div>
                      <div className="text-xs text-gray-500">
                        {center.contact}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCenter(center)}
                        title="Edit"
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deleteCenter(center.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingCenter && (
        <EditCenterModal
          center={editingCenter}
          onClose={() => setEditingCenter(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

function EditCenterModal({
  center,
  onClose,
  onSave,
}: {
  center: Center;
  onClose: () => void;
  onSave: (c: Center) => void;
}) {
  const [form, setForm] = useState<Center>(center);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Edit Center</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </Field>
          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacity">
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </Field>
            <Field label="Current Load">
              <input
                type="number"
                value={form.currentLoad}
                onChange={(e) => setForm({ ...form, currentLoad: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </Field>
          </div>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Center["status"] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </Field>
          <Field label="Manager">
            <input
              value={form.manager}
              onChange={(e) => setForm({ ...form, manager: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </Field>
          <Field label="Contact">
            <input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:brightness-110"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
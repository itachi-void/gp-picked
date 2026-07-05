import { useMemo, useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, MapPin, X } from 'lucide-react';

type RouteStatus = 'active' | 'completed' | 'scheduled';

interface Route {
  id: string;
  name: string;
  driver: string;
  stops: number;
  distance: string;
  duration: string;
  status: RouteStatus;
}

const initialRoutes: Route[] = [
  { id: '101', name: 'Cairo Downtown', driver: 'Ahmed Mohamed', stops: 12, distance: '45.2 km', duration: '3h 20min', status: 'active' },
  { id: '102', name: 'Giza District', driver: 'Mohamed Ali', stops: 15, distance: '52.8 km', duration: '4h 15min', status: 'active' },
  { id: '103', name: 'Nasr City', driver: 'Khaled Hassan', stops: 10, distance: '38.5 km', duration: '2h 45min', status: 'completed' },
  { id: '104', name: 'Heliopolis', driver: 'Omar Ibrahim', stops: 14, distance: '48.3 km', duration: '3h 50min', status: 'scheduled' },
  { id: '105', name: 'Maadi Area', driver: 'Youssef Ahmed', stops: 11, distance: '42.1 km', duration: '3h 10min', status: 'active' },
  { id: '106', name: '6th October', driver: 'Mahmoud Said', stops: 18, distance: '65.4 km', duration: '5h 20min', status: 'scheduled' },
  { id: '107', name: 'Zamalek', driver: 'Hassan Fouad', stops: 8, distance: '28.7 km', duration: '2h 15min', status: 'completed' },
  { id: '108', name: 'Mohandessin', driver: 'Ibrahim Kamal', stops: 13, distance: '44.9 km', duration: '3h 30min', status: 'active' },
  { id: '109', name: 'New Cairo', driver: 'Tarek Nabil', stops: 16, distance: '58.2 km', duration: '4h 40min', status: 'scheduled' },
  { id: '110', name: 'Dokki', driver: 'Amr Samir', stops: 9, distance: '35.6 km', duration: '2h 50min', status: 'completed' },
  { id: '111', name: 'Shubra', driver: 'Waleed Adel', stops: 12, distance: '41.3 km', duration: '3h 15min', status: 'scheduled' },
  { id: '112', name: 'Imbaba', driver: 'Sherif Magdy', stops: 11, distance: '39.8 km', duration: '3h 5min', status: 'active' },
  { id: '113', name: 'Agouza', driver: 'Ahmed Mohamed', stops: 10, distance: '37.2 km', duration: '2h 55min', status: 'completed' },
  { id: '114', name: 'Garden City', driver: 'Mohamed Ali', stops: 7, distance: '26.4 km', duration: '2h 10min', status: 'scheduled' },
  { id: '115', name: 'Rehab City', driver: 'Khaled Hassan', stops: 17, distance: '61.5 km', duration: '4h 55min', status: 'active' },
];

const emptyForm: Omit<Route, 'id'> = {
  name: '',
  driver: '',
  stops: 0,
  distance: '',
  duration: '',
  status: 'scheduled',
};

export function Routes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RouteStatus>('all');
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);

  const [viewing, setViewing] = useState<Route | null>(null);
  const [editing, setEditing] = useState<Route | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Route, 'id'>>(emptyForm);

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return routes.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.driver.toLowerCase().includes(q) ||
        r.id.includes(q);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [routes, searchQuery, statusFilter]);

  const getStatusColor = (status: RouteStatus) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-amber-100 text-amber-700';
    }
  };

  const handleDelete = (route: Route) => {
    if (window.confirm(`Delete route "${route.name}"?`)) {
      setRoutes((prev) => prev.filter((r) => r.id !== route.id));
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setCreating(true);
  };

  const openEdit = (route: Route) => {
    setForm({
      name: route.name,
      driver: route.driver,
      stops: route.stops,
      distance: route.distance,
      duration: route.duration,
      status: route.status,
    });
    setEditing(route);
  };

  const handleSubmitCreate = () => {
    if (!form.name.trim() || !form.driver.trim()) {
      alert('Please fill in route name and driver.');
      return;
    }
    const nextId = String(
      Math.max(...routes.map((r) => Number(r.id)), 100) + 1
    );
    setRoutes((prev) => [{ id: nextId, ...form }, ...prev]);
    setCreating(false);
    setForm(emptyForm);
  };

  const handleSubmitEdit = () => {
    if (!editing) return;
    if (!form.name.trim() || !form.driver.trim()) {
      alert('Please fill in route name and driver.');
      return;
    }
    setRoutes((prev) =>
      prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r))
    );
    setEditing(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Routes</h1>
          <p className="text-gray-600 mt-1">Manage collection routes</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:brightness-110 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">New Route</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | RouteStatus)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredRoutes.length} of {routes.length} routes
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Route</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Driver</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Stops</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Distance</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Duration</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No routes match your filters.
                  </td>
                </tr>
              )}
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                        #{route.id}
                      </div>
                      <div>
                        <p className="font-semibold">{route.name}</p>
                        <p className="text-sm text-gray-500">Route #{route.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                        {route.driver.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-medium">{route.driver}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{route.stops}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{route.distance}</td>
                  <td className="py-4 px-6 text-gray-600">{route.duration}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(route.status)}`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewing(route)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(route)}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(route)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Dialog */}
      {viewing && (
        <Modal title={`Route #${viewing.id} — ${viewing.name}`} onClose={() => setViewing(null)}>
          <div className="space-y-3 text-sm">
            <Row label="Driver" value={viewing.driver} />
            <Row label="Stops" value={String(viewing.stops)} />
            <Row label="Distance" value={viewing.distance} />
            <Row label="Duration" value={viewing.duration} />
            <Row label="Status" value={viewing.status} />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setViewing(null)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Create/Edit Dialog */}
      {(creating || editing) && (
        <Modal
          title={editing ? `Edit Route #${editing.id}` : 'New Route'}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        >
          <RouteForm form={form} setForm={setForm} />
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={editing ? handleSubmitEdit : handleSubmitCreate}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110 font-semibold"
            >
              {editing ? 'Save Changes' : 'Create Route'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

function RouteForm({
  form,
  setForm,
}: {
  form: Omit<Route, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<Route, 'id'>>>;
}) {
  return (
    <div className="space-y-3">
      <Field label="Route Name">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </Field>
      <Field label="Driver">
        <input
          value={form.driver}
          onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Stops">
          <input
            type="number"
            min={0}
            value={form.stops}
            onChange={(e) => setForm((f) => ({ ...f, stops: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </Field>
        <Field label="Distance">
          <input
            placeholder="45.2 km"
            value={form.distance}
            onChange={(e) => setForm((f) => ({ ...f, distance: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </Field>
        <Field label="Duration">
          <input
            placeholder="3h 20min"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </Field>
      </div>
      <Field label="Status">
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RouteStatus }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
        >
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </Field>
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

export default Routes;
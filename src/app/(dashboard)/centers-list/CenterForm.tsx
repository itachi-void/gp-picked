import React from 'react'
import {Center} from "./page"
// ========== فورم ==========
function CenterForm({ form, setForm }: { form: Center; setForm: (c: Center) => void }) {
  
  const inputCls = "w-full px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

    return (
    <div className="space-y-3">
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Name</span>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
      </label>
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Location</span>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Capacity</span>
          <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Current Load</span>
          <input type="number" value={form.currentLoad} onChange={(e) => setForm({ ...form, currentLoad: Number(e.target.value) })} className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Status</span>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Center["status"] })} className={inputCls}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </label>
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Manager</span>
        <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} className={inputCls} />
      </label>
      <label className="block">
        <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Contact</span>
        <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={inputCls} />
      </label>
    </div>
  );
}


export default CenterForm
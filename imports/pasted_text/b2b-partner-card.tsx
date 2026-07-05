"use client";

import {
  Building2,
  Star,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  ChevronRight,
  Truck,
  Plus,
  CheckCircle,
  Clock,
  Recycle,
  Factory,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useB2B } from "@/app/contexts/B2BContext";
import type { B2BPartnerExtended, PartnerType } from "@/app/contexts/B2BContext";
import { AssignShipmentModal } from "@/app/components/AssignShipmentModal";
import { AddPartnerModal } from "@/app/components/AddPartnerModal";
import { usePickup } from "@/app/contexts/PickupContext";
import { ShipmentVolumeChart } from "@/app/components/ShipmentVolumeChart";

/* ── Helpers ── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

function TypeIcon({ type }: { type: PartnerType }) {
  const map = {
    Factory: { icon: Factory, color: "bg-emerald-100 text-emerald-600" },
    Recycler: { icon: Recycle, color: "bg-blue-100 text-blue-600" },
    Manufacturer: { icon: Building2, color: "bg-violet-100 text-violet-600" },
  };
  const { icon: Icon, color } = map[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}>
      <Icon className="w-3 h-3" />
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: B2BPartnerExtended["status"] }) {
  const map = {
    Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Inactive: "bg-gray-100 text-gray-500 border-gray-200",
    Negotiating: "bg-amber-100 text-amber-700 border-amber-200",
  };
  const dot = {
    Active: "bg-emerald-500 animate-pulse",
    Inactive: "bg-gray-400",
    Negotiating: "bg-amber-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

/* ── Partner Card ── */
function PartnerCard({
  partner,
  index,
  shipmentCount,
  onAssign,
}: {
  partner: B2BPartnerExtended;
  index: number;
  shipmentCount: number;
  onAssign: (p: B2BPartnerExtended) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const targetTons = partner.monthlyCapacity * 12;
  const progressPct = Math.min(100, (partner.tonsContributed / targetTons) * 100);

  const gradientMap: Record<PartnerType, string> = {
    Factory: "from-emerald-500 to-teal-600",
    Recycler: "from-blue-500 to-cyan-600",
    Manufacturer: "from-violet-500 to-purple-600",
  };
  const gradient = gradientMap[partner.type];

  return (
    <div
      className="stagger-in bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${gradient} p-5`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${partner.avatarColor} rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
              {partner.initials}
            </div>
            <div>
              <h3 className="font-bold text-white">{partner.name}</h3>
              <TypeIcon type={partner.type} />
            </div>
          </div>
          <StatusBadge status={partner.status} />
        </div>

        {/* Sustainability contribution bar */}
        <div className="mt-4">
          <div className="flex justify-between text-white/80 text-xs mb-1.5">
            <span>Sustainability Contribution</span>
            <span className="font-semibold">{partner.tonsContributed.toFixed(1)} t</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-white/60 text-xs mt-1">
            <span>0 t</span>
            <span>{targetTons} t annual capacity</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{partner.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Tons Bought", value: `${partner.tonsContributed.toFixed(0)}t`, icon: Package, color: "text-emerald-600 bg-emerald-50" },
            { label: "Contract", value: `$${(partner.contractValueUSD / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-blue-600 bg-blue-50" },
            { label: "Shipments", value: String(shipmentCount), icon: Truck, color: "text-violet-600 bg-violet-50" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className={`w-8 h-8 rounded-xl ${stat.color.split(" ")[1]} flex items-center justify-center mx-auto mb-1`}>
                <stat.icon className={`w-4 h-4 ${stat.color.split(" ")[0]}`} />
              </div>
              <p className="font-bold text-gray-800 text-sm">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <StarRating rating={partner.rating} />

        {/* Plastic Types */}
        <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
          {partner.plasticTypes.map((pt) => (
            <span key={pt} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
              {pt}
            </span>
          ))}
        </div>

        {/* Expandable contact info */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-3"
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
          {expanded ? "Hide" : "Show"} contact details
        </button>

        {expanded && (
          <div className="space-y-2 mb-4 stagger-in" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{partner.contact}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${partner.email}`} className="hover:text-emerald-600 transition-colors">{partner.email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{partner.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{partner.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Active since {partner.activeSince}</span>
            </div>
          </div>
        )}

        {/* Assign Shipment Button */}
        <button
          onClick={() => onAssign(partner)}
          disabled={partner.status === "Inactive"}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            partner.status === "Inactive"
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : `bg-gradient-to-r ${gradient} text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0`
          }`}
        >
          <Truck className="w-4 h-4" />
          Assign Shipment
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function B2BPartners() {
  const { partners, shipments, totalTons, totalRevenue } = useB2B();
  const { requests } = usePickup();
  const [selectedPartner, setSelectedPartner] = useState<B2BPartnerExtended | null>(null);
  const [filterType, setFilterType] = useState<PartnerType | "All">("All");
  const [filterStatus, setFilterStatus] = useState<B2BPartnerExtended["status"] | "All">("All");
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);

  const completedCount = requests.filter((r) => r.status === "Completed").length;
  const activePartners = partners.filter((p) => p.status === "Active").length;

  const filteredPartners = partners.filter((p) => {
    if (filterType !== "All" && p.type !== filterType) return false;
    if (filterStatus !== "All" && p.status !== filterStatus) return false;
    return true;
  });

  const getShipmentCount = (partnerId: string) =>
    shipments.filter((s) => s.partnerId === partnerId).length;

  const kpis = [
    { label: "Total Partners", value: partners.length, icon: Building2, color: "from-emerald-500 to-teal-500", sub: `${activePartners} active` },
    { label: "Tons Processed", value: `${totalTons.toFixed(0)}t`, icon: Recycle, color: "from-blue-500 to-cyan-500", sub: "sustainability contribution" },
    { label: "Contract Portfolio", value: `$${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "from-violet-500 to-purple-500", sub: "total contract value" },
    { label: "Batches Assigned", value: shipments.length, icon: Truck, color: "from-amber-500 to-orange-500", sub: `${completedCount} completed pickups` },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="stagger-in" style={{ animationDelay: "0ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              B2B Partners
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              Manage industrial recycling partnerships & shipment routing
            </p>
          </div>
          <button
            onClick={() => setAddPartnerOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="stagger-zoom bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            style={{ animationDelay: `${i * 18}ms` }}
          >
            <div className={`h-1.5 bg-gradient-to-r ${kpi.color}`} />
            <div className="p-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
              <p className="text-sm font-medium text-gray-700">{kpi.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipment Volume Chart */}
      <ShipmentVolumeChart />

      {/* Filters */}
      <div
        className="stagger-in flex flex-wrap items-center gap-3"
        style={{ animationDelay: "25ms" }}
      >
        <span className="text-sm font-medium text-gray-600">Filter by:</span>
        {/* Type Filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["All", "Factory", "Recycler", "Manufacturer"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === t ? "bg-white text-gray-800 shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["All", "Active", "Negotiating", "Inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s ? "bg-white text-gray-800 shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {(filterType !== "All" || filterStatus !== "All") && (
          <button
            onClick={() => { setFilterType("All"); setFilterStatus("All"); }}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Partners Grid / Empty State */}
      {filteredPartners.length === 0 ? (
        <div className="stagger-in text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ animationDelay: "38ms" }}>
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">No Partners Found</p>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            No B2B partners match the selected filters. Try adjusting your filters or add a new partner.
          </p>
          <button
            onClick={() => { setFilterType("All"); setFilterStatus("All"); }}
            className="mt-4 px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPartners.map((partner, i) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              index={i}
              shipmentCount={getShipmentCount(partner.id)}
              onAssign={setSelectedPartner}
            />
          ))}
        </div>
      )}

      {/* Shipments Log */}
      {shipments.length > 0 && (
        <div className="stagger-in bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden" style={{ animationDelay: "50ms" }}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-gray-800">Assigned Shipments Log</h3>
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
              {shipments.length} total
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {shipments.map((shipment, i) => {
              const partner = partners.find((p) => p.id === shipment.partnerId);
              const gradientMap: Record<PartnerType, string> = {
                Factory: "from-emerald-500 to-teal-600",
                Recycler: "from-blue-500 to-cyan-600",
                Manufacturer: "from-violet-500 to-purple-600",
              };
              const gradient = partner ? gradientMap[partner.type] : "from-gray-400 to-gray-500";
              return (
                <div
                  key={shipment.id}
                  className="stagger-left px-6 py-4 flex items-center gap-4"
                  style={{ animationDelay: `${i * 15}ms` }}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-xs`}>
                    {partner?.initials ?? "??"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800">
                      {shipment.pickupRequestId}{" "}
                      <span className="text-gray-400">→</span>{" "}
                      {partner?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shipment.assignedAt.toLocaleString("en-GB")} · {(shipment.tonsShipped * 1000).toFixed(1)} kg
                    </p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                    {shipment.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assign Shipment Modal */}
      <AssignShipmentModal
        partner={selectedPartner}
        isOpen={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
      />

      {/* Add Partner Modal */}
      <AddPartnerModal
        isOpen={addPartnerOpen}
        onClose={() => setAddPartnerOpen(false)}
      />
    </div>
  );
}
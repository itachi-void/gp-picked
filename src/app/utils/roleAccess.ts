export function homePathForRole(role: string): string {
  const norm = String(role || "").toLowerCase().trim();
  switch (norm) {
    case "admin":
      return "/overview";
    case "driver":
    case "recycler":
      return "/driver-portal";
    case "employee":
      return "/verification";
    case "user":
    case "citizen":
    default:
      return "/citizen-portal";
  }
}

export function canAccess(role: string, path: string): boolean {
  const normRole = role.toLowerCase();
  
  // Admin has access to all routes
  if (normRole === "admin") {
    return true;
  }

  // Manager has broad access except some admin features
  if (normRole === "manager") {
    const adminOnly = ["/permissions", "/audit", "/activity-log"];
    return !adminOnly.some(p => path.startsWith(p));
  }

  // Driver/Recycler has access to active operational tabs
  if (normRole === "driver" || normRole === "recycler") {
    const driverRoutes = [
      "/driver-portal",
      "/driver-home",
      "/pickups",
      "/routes",
      "/fleet",
      "/schedule",
      "/logistics",
      "/support"
    ];
    return driverRoutes.some(p => path === p || path.startsWith(p + "/"));
  }

  // Employee has station/verification access
  if (normRole === "employee" || normRole === "hubstaff") {
    const employeeRoutes = [
      "/verification",
      "/employee-history",
      "/employee-profile",
      "/pickups",
      "/support",
      "/centers-list",
      "/ai-validation"
    ];
    return employeeRoutes.some(p => path === p || path.startsWith(p + "/"));
  }

  // Citizen (User role in store) has access to portal and engagement items
  if (normRole === "citizen" || normRole === "user") {
    const citizenRoutes = [
      "/citizen-portal",
      "/portal",
      "/citizen-levels",
      "/badges",
      "/leaderboards",
      "/rewards",
      "/citizen-stats",
      "/sustainability",
      "/support",
      "/settings"
    ];
    return citizenRoutes.some(p => path === p || path.startsWith(p + "/"));
  }

  return false;
}


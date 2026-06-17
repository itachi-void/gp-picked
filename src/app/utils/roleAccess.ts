export function homePathForRole(role: "Citizen" | "Driver" | "Admin" | string): string {
  switch (role) {
    case "Admin":
      return "/dashboard";
    case "Driver":
      return "/driver-portal";
    case "Citizen":
    default:
      return "/citizen-portal";
  }
}

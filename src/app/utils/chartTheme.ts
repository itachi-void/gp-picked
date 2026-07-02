export const tooltipStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? "#0f172a" : "#ffffff",
  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
  borderRadius: "12px",
  color: isDark ? "#f8fafc" : "#0f172a",
  fontSize: "12px",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
});

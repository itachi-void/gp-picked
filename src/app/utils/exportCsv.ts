export function exportToCsv<T>(
  filename: string,
  data: T[],
  columns: { key: string; label: string; accessor: (row: T) => any }[]
) {
  const headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = col.accessor(row);
        const strVal = val === null || val === undefined ? "" : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvString = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// // تنسيق التاريخ والوقت لعمليات التحقق
// export function formatVerificationDate(dateStr?: string): string {
//   if (!dateStr) return new Date().toLocaleDateString();
//   try {
//     return new Date(dateStr).toLocaleDateString();
//   } catch {
//     return dateStr;
//   }
// }

export function formatVerificationDate(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toLocaleDateString();
  }

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString();
}
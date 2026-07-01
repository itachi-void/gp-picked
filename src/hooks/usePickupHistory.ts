import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { PickupHistory } from "@/types/pickup";
import { toast } from "sonner";

// دالة جلب البيانات مع الـ Fallback والتعامل مع الـ 404 (سجل فارغ)
const fetchPickupHistory = async (userId: string | number): Promise<PickupHistory[]> => {
  try {
    const response = await api.get(`/PickupRequests/user-history/${userId}`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error: any) {
    const status = error.response?.status;
    
    // إذا كان الكود 404، فهذا يعني في أغلب الـ REST APIs أن السجل فارغ ولا توجد طلبات للمستخدم
    // نقوم بإرجاع مصفوفة فارغة [] بدلاً من إظهار خطأ فشل التحميل
    if (status === 404) {
      console.warn("⚠️ No history found (404), returning empty array.");
      return [];
    }

    // إذا كان الكود 403 (غير مصرح)، نجرب الـ Fallback على my-history
    if (status === 403) {
      console.warn(`⚠️ Fallback to my-history due to status 403`);
      try {
        const response = await api.get(`/PickupRequests/my-history`);
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return [];
      } catch (fallbackError: any) {
        // إذا رجع الـ Fallback أيضاً 404، نعتبره سجل فارغ
        if (fallbackError.response?.status === 404) {
          console.warn("⚠️ No history found in my-history (404), returning empty array.");
          return [];
        }
        throw fallbackError;
      }
    }
    throw error;
  }
};

export function usePickupHistory(userId: string | number | undefined) {
  const query = useQuery({
    queryKey: ["pickupHistory", userId],
    queryFn: () => fetchPickupHistory(userId!),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // الـ Cache Time في React Query v5
    enabled: !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { error, isError } = query;

  useEffect(() => {
    if (isError && error) {
      const message = (error as any).response?.data?.message || "Failed to load history";
      toast.error(message);
    }
  }, [isError, error]);

  return query;
}

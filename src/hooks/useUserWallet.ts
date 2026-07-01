import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface UserWalletData {
  walletPoints: number;
}

// دالة جلب بيانات محفظة النقاط مباشرة من السيرفر بدون وسيط محلي
async function fetchUserWallet(userId: string | number): Promise<UserWalletData> {
  const response = await api.get(`/User/GetUserByIdWithDetails/${userId}`);
  const data = response.data;
  
  // استخراج النقاط من الاستجابة
  const walletPoints = data?.walletPoints ?? data?.data?.walletPoints ?? 0;
  return { walletPoints };
}

export function useUserWallet(userId?: string | number) {
  return useQuery({
    queryKey: ["userWallet", userId],
    queryFn: () => fetchUserWallet(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // تحديث البيانات كل 30 ثانية
    staleTime: 10000,
  });
}

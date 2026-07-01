import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/store/authStore";
import { toast } from "sonner";

// الواجهات البرمجية الخاصة بالاستجابة للرفع والـ Wallet
export interface UploadResponse {
  message: string;
  transactionId: number;
}

export function useUploadEcoSnap() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("File", file);

      const response = await api.post<UploadResponse>(
        "/User/UploadEcoSnapImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // مهلة انتهاء الطلب (Timeout) بعد 30 ثانية
          timeout: 30000,
        }
      );
      console.log("UploadEcoSnap response.data:", response.data);
      return response.data;
    },

    // إظهار التنبيه فقط عند بدء عملية الرفع
    onMutate: async () => {
      toast.loading("📤 Uploading EcoSnap...", {
        id: "upload-toast",
      });
    },

    // ✅ عند نجاح عملية الرفع (تتحول إلى حالة انتظار المراجعة من موظف الـ Hub)
    onSuccess: (data: UploadResponse) => {
      console.log("UploadEcoSnap onSuccess data:", data);
      toast.dismiss("upload-toast");

      toast.success(
        `✅ EcoSnap uploaded successfully! Pending verification by Hub Staff.`,
        {
          duration: 5000,
          icon: "🎉",
        }
      );

      const queryKey = ["userWallet", String(userId)];

      // تحديث الاستعلامات النشطة
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "active",
      });
    },

    // ❌ عند فشل عملية الرفع
    onError: (error: any, variables: File) => {
      toast.dismiss("upload-toast");

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload EcoSnap";

      // التعامل مع أكواد أخطاء السيرفر المحددة
      if (error.response?.status === 413) {
        toast.error("❌ File too large. Maximum size is 5MB.");
      } else if (error.response?.status === 415) {
        toast.error("❌ Unsupported file type. Please upload JPEG or PNG.");
      } else if (error.code === "ECONNABORTED") {
        toast.error("❌ Upload timeout. Please try again.");
      } else {
        toast.error(`❌ ${message}`);
      }

      console.error("Upload error:", {
        error,
        file: variables.name,
        size: variables.size,
      });
    },

    // 🔄 عند النهاية (سواء نجاح أو فشل)
    onSettled: () => {
      toast.dismiss("upload-toast");

      const queryKey = ["userWallet", String(userId)];
      queryClient.invalidateQueries({
        queryKey,
        refetchType: "all",
      });
    },

    // ⚙️ إعدادات إعادة المحاولة عند الفشل
    retry: (failureCount, error) => {
      // تجنب إعادة المحاولة لبعض الأخطاء غير القابلة للإصلاح التلقائي
      if (
        error.response?.status === 400 ||
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.response?.status === 413 ||
        error.response?.status === 415
      ) {
        return false;
      }
      return failureCount < 3;
    },

    retryDelay: (attemptIndex) => {
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },

    // ⏱️ وقت انتهاء الصلاحية
    gcTime: 1000 * 60 * 5, // 5 دقائق في React Query v5
  });
}

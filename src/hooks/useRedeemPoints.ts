import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/store/authStore";
import { toast } from "sonner";

export interface RedeemPointsParams {
  walletNumber: string;
  pointsToRedeem: number;
}

export function useRedeemPoints() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async ({ walletNumber, pointsToRedeem }: RedeemPointsParams): Promise<string> => {
      // API call: POST /api/Payment/redeem-points-to-cash with query parameters
      const response = await api.post(
        "/Payment/redeem-points-to-cash",
        null, // No body
        {
          params: {
            walletNumber,
            pointsToRedeem,
          },
          responseType: "text", // The API returns a plain text string: "Points redeemed successfully"
        }
      );
      return response.data;
    },

    onMutate: () => {
      toast.loading("💸 Processing points redemption...", {
        id: "redeem-toast",
      });
    },

    onSuccess: (message) => {
      toast.dismiss("redeem-toast");
      toast.success(message || "Points redeemed successfully!", {
        duration: 5000,
        icon: "🎉",
      });

      // Refetch the user's wallet points to update the UI
      queryClient.invalidateQueries({
        queryKey: ["userWallet", userId],
        refetchType: "all",
      });
    },

    onError: (error: any) => {
      toast.dismiss("redeem-toast");
      const message =
        error.response?.data ||
        error.response?.data?.message ||
        error.message ||
        "Error processing redemption";
      toast.error(`❌ ${message}`);
      console.error("Redemption error:", error);
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { verifyShipment } from "../services/verification.service";

interface VerifyMutationParams {
  id: number;
  file: File;
}

export function useVerifyShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: VerifyMutationParams) =>
      verifyShipment(id, file),

    onSuccess: () => {
      toast.success("AI Verification complete!");

      queryClient.invalidateQueries({
        queryKey: ["inProgressHubRequests"],
      });
    },

    onError: (error: AxiosError) => {
      const responseData = error.response?.data as any;
      const isValidationResult = responseData && (responseData.status || responseData.message === "Quantity Mismatch Error!");

      if (!isValidationResult) {
        toast.error(
          (error.response?.data as { message?: string })?.message ??
            "Verification shipment failed"
        );
      }
    },
  });
}
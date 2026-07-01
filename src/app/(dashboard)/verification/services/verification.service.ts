import api from "@/lib/axios";
import { HubRequest, VerifyResponse } from "../types";

// جلب طلبات الجمع قيد التنفيذ للـ HubStaff
export async function getInProgressHubRequests(): Promise<HubRequest[]> {
  const response = await api.get<HubRequest[]>("/PickupRequests/GetInProgressHubRequests");
  return response.data || [];
}

// التحقق من شحنة الطلب عبر الـ AI وموظف الـ Hub
export async function verifyShipment(id: number, file: File): Promise<VerifyResponse> {
  const formData = new FormData();
  formData.append("fileAfter", file);

  const response = await api.post<VerifyResponse>(
    `/HubStaff/VerifyRequestShipment?transactionId=${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

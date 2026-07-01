import { useQuery } from "@tanstack/react-query";
import { getInProgressHubRequests } from "../services/verification.service";
import { HubRequest } from "../types";

export function useHubRequests() {
  return useQuery<HubRequest[]>({
    queryKey: ["inProgressHubRequests"],
    queryFn: getInProgressHubRequests,
  });
}

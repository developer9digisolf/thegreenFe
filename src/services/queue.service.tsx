import request from "@afx/utils/request.utils";
import type {
  GetBranchesParams,
  Branch,
  TherapistAPIResponse,
  TherapistsResponse,
} from "@afx/interfaces/queue.iface";

/**
 * Get branches with search and pagination support
 */
export function GetBranchesService(params: GetBranchesParams = {}) {
  const queryParams = {
    Page: params.Page ?? 1,
    PageSize: params.PageSize ?? 10,
    Search: params.Search ?? "",
    SortColumn: params.SortColumn ?? "createdAt",
    SortDirection: params.SortDirection ?? "asc",
  };

  return request<{ success: boolean; message: string; data: Branch[] }>({
    url: "master/branches",
    data: queryParams,
    method: "GET",
  });
}

/**
 * Get therapists for today by branch ID
 */
export function GetTherapistsTodayService(branchId: number) {
  return request<TherapistsResponse>({
    url: `pos/therapists/today?branchId=${branchId}`,
    method: "GET",
  });
}

/**
 * Transform API response to TherapistQueue format
 */
export function transformTherapistData(
  apiData: TherapistAPIResponse[],
): TherapistAPIResponse[] {
  return apiData;
}

/**
 * Get leaderboard today
 */
export function GetLeaderboardTodayService(branchId?: number) {
  const url = branchId ? `leaderboard/today?branchId=${branchId}` : "leaderboard/today";
  return request<any>({
    url,
    method: "GET",
  });
}

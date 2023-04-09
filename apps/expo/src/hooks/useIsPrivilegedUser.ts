import { api, type RouterOutputs } from "../utils/api";
import { useRefreshOnFocus } from "./useRefreshOnFocus";

type UserRoles = RouterOutputs["auth"]["getAuthUser"]["role"];

export function useIsPrivilegedUser(): [boolean, UserRoles] {
  const user = api.auth.getAuthUser.useQuery();
  useRefreshOnFocus(user.refetch);

  if (!user.data) return [false, "employee"];

  return [user.data.role === "admin" || user.data.isOwner, user.data.role];
}

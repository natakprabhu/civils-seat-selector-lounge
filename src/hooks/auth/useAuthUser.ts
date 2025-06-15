
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export const useAuthUser = () => {
  const { user, loading } = useContext(AuthContext);
  return { user, loading };
};

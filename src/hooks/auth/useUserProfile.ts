
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export const useUserProfile = () => {
  const { userProfile, completeProfile, fetchProfile } = useContext(AuthContext);
  return { userProfile, completeProfile, fetchProfile };
};

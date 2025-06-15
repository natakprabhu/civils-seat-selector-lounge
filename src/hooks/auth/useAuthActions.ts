
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export const useAuthActions = () => {
  const { sendOtp, verifyOtp, signOut } = useContext(AuthContext);
  return { sendOtp, verifyOtp, signOut };
};

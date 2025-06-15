
import React from "react";

interface Props {
  mode: "login" | "signup" | "forgot";
  setMode: (mode: "login" | "signup" | "forgot") => void;
}

const SwitchAuthModeLinks: React.FC<Props> = ({ mode, setMode }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {mode === "login" && (
        <>
          <button
            className="text-sm text-blue-400 hover:underline"
            type="button"
            onClick={() => setMode("forgot")}
          >
            Forgot password?
          </button>
          <div className="text-sm text-slate-400 mt-2">
            Don't have an account?{" "}
            <button
              className="text-blue-400 hover:underline"
              type="button"
              onClick={() => setMode("signup")}
            >
              Create your account
            </button>
          </div>
        </>
      )}
      {mode === "signup" && (
        <div className="text-sm text-slate-400 mt-2">
          Already have an account?{" "}
          <button
            className="text-blue-400 hover:underline"
            type="button"
            onClick={() => setMode("login")}
          >
            Log in
          </button>
        </div>
      )}
      {mode === "forgot" && (
        <div className="text-sm text-slate-400 mt-2">
          Remembered?{" "}
          <button
            className="text-blue-400 hover:underline"
            type="button"
            onClick={() => setMode("login")}
          >
            Back to login
          </button>
        </div>
      )}
    </div>
  );
};

export default SwitchAuthModeLinks;

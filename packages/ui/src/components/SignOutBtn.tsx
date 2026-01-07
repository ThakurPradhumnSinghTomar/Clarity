import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="
        flex items-center gap-1.5
        px-3 py-1.5
        text-sm font-medium
        rounded-md
        bg-red-400/90 text-white
        hover:bg-red-500/90
        transition
        shadow-sm hover:shadow
      "
    >
      <LogOut size={14} />
      <span>Sign out</span>
    </button>
  );
}

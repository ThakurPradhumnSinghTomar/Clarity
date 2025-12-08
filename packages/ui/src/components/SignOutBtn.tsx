import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/login', // Redirect to login page after sign out
        redirect: true,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
    >
      <LogOut size={18} />
      <span>Sign Out</span>
    </button>
  );
}
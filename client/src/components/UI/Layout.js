import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSignOut = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/signout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.ok) {
        // remove JWT and user from local storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/signin"); // Redirect to login page after sign-out
      } else {
        console.error("Sign out failed:", await response.json());
        alert("Sign out failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during sign out:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900">
      {/* Header with Centered Navigation */}
      <header className="flex items-center justify-between p-4 bg-[#E8F8FF] shadow-md w-full">
        {/* Left Section: Logo & Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Clinical Clarity</h1>
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <img
                src="/ClinicalClarityLogo.png"
                alt="Clinical Clarity Logo"
                className="h-12"
              />
            </div>
          </Link>
        </div>

        {/* Center Section: Navigation Buttons */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-8">
          {/* Home */}
          <button className="nav-button" onClick={() => router.push("/")}>
            <img src="/HomePage.png" alt="Home" className="h-8" />
            <p className="nav-text">Home</p>
          </button>

          {/* Progress */}
          <button className="nav-button" onClick={() => alert("Progress Page Coming Soon!")}>
            <img src="/Progress.png" alt="Progress" className="h-8" />
            <p className="nav-text">Progress</p>
          </button>

          {/* Daily Challenge */}
          <button className="nav-button" onClick={() => alert("Daily Challenge Coming Soon!")}>
            <img src="/DailyChallenge.png" alt="Daily Challenge" className="h-8" />
            <p className="nav-text">Daily</p>
          </button>

          {/* Account */}
          <button className="nav-button" onClick={() => alert("Account Page Coming Soon!")}>
            <img src="/Account.png" alt="Account" className="h-8" />
            <p className="nav-text">Account</p>
          </button>
        </div>

        {/* Right Section: Sign Out Button */}
        <div className="w-32 flex justify-end">
          <button className="nav-button" onClick={handleSignOut}>
            <img src="/signout.ico" alt="Sign Out" className="h-8" />
            <p className="nav-text">Sign Out</p>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}

import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();

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

        {/* Right Section: Empty Space (Keeps Navbar Centered) */}
        <div className="w-32"></div>
      </header>

      {/* Page Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}

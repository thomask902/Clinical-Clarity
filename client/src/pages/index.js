import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen text-center px-6 pt-24">
      {/* Hero Section */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="welcome-text">
          Welcome to <span className="brand-text">Clinical Clarity!</span>
        </h1>
        <p className="subtext">
          Begin your clinical communication journey today by selecting a simulated scenario.
        </p>
      </div>

      {/* Button Section */}
      <div className="mt-8">
        <button className="button-primary" onClick={() => router.push("/scenarioselection")}>
          Scenario Selection
        </button>
      </div>
    </div>
  );
}

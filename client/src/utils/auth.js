import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// Authentication hook to check if the user is logged in
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // redirect to login if user is not authenticated
      router.push("/signin");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  return isAuthenticated;
}
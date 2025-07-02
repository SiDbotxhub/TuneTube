import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LocationData {
  city: string;
  country: string;
  countryCode: string;
  region: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ["/api/location"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/location");
      return response.json();
    },
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setLocation(data);
      setIsLoading(false);
    } else if (!queryLoading) {
      setIsLoading(false);
    }
  }, [data, queryLoading]);

  return { location, isLoading };
}

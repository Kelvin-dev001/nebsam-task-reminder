import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function useCeoDashboardData(monthsToFetch = 6) {
  const [data, setData] = useState({
    trends: null,
    monthly: null,
    monthlySeries: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [months, setMonths] = useState(monthsToFetch);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [trends, monthly, monthlySeries] = await Promise.all([
        api.get("/analytics/trends").then((r) => r.data),
        api.get("/analytics/monthly").then((r) => r.data),
        api.get(`/analytics/monthly-series?months=${months}`).then((r) => r.data),
      ]);
      setData({ trends, monthly, monthlySeries });
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err?.response?.data?.error || err.message || "Analytics fetch failed"
      );
    }
    setLoading(false);
  }, [months]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    ...data,
    loading,
    error,
    lastUpdated,
    months,
    setMonths,
    refetch: fetchData,
  };
}
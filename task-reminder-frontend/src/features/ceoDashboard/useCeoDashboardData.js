import { useState, useEffect, useCallback } from "react";
import api from "../../api";

const ENDPOINTS = [
  "/analytics/trends",
  "/analytics/monthly",
  "/analytics/monthly-series",
];

const fetchAll = async () => {
  // parallel fetch all analytics endpoints
  const [trends, monthly, monthlySeries] = await Promise.all(
    ENDPOINTS.map(url => api.get(url).then(res => res.data))
  );
  return { trends, monthly, monthlySeries };
};

export default function useCeoDashboardData(refreshMs = 5 * 60 * 1000) {
  const [data, setData] = useState({ trends: null, monthly: null, monthlySeries: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await fetchAll();
      setData(d);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Analytics fetch failed");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshMs);
    return () => clearInterval(interval);
  }, [fetchData, refreshMs]);

  return {
    ...data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
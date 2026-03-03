import { useState, useEffect, useCallback } from "react";
import api from "../../api";

// Get current month as YYYY-MM
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function useCeoDashboardData() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [data, setData] = useState(null);
  const [monthlySeries, setMonthlySeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch selected month data + 6-month series in parallel
      const [monthData, seriesData] = await Promise.all([
        api.get(`/analytics/ceo-month?month=${selectedMonth}`).then((r) => r.data),
        api.get("/analytics/monthly-series?months=6").then((r) => r.data),
      ]);
      setData(monthData);
      setMonthlySeries(seriesData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err?.response?.data?.error || err.message || "Analytics fetch failed"
      );
    }
    setLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    monthlySeries,
    loading,
    error,
    lastUpdated,
    selectedMonth,
    setSelectedMonth,
    refetch: fetchData,
  };
}
import { useState, useEffect, useCallback } from "react";
import api from "../../api";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function useCeoDashboardData() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Month-filtered data (KPIs + showroom leaderboard)
  const [monthData, setMonthData] = useState(null);

  // 6-month series data (charts — NOT filtered by month picker)
  const [monthlySeries, setMonthlySeries] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch month-specific data (KPIs + showroom)
  const fetchMonthData = useCallback(async () => {
    try {
      const res = await api.get(`/analytics/ceo-month?month=${selectedMonth}`);
      setMonthData(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Month data fetch failed");
    }
  }, [selectedMonth]);

  // Fetch 6-month series (charts — always last 6 months, independent of picker)
  const fetchSeriesData = useCallback(async () => {
    try {
      const res = await api.get("/analytics/monthly-series?months=6");
      setMonthlySeries(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Series fetch failed");
    }
  }, []);

  // Combined fetch
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    await Promise.all([fetchMonthData(), fetchSeriesData()]);
    setLastUpdated(new Date());
    setLoading(false);
  }, [fetchMonthData, fetchSeriesData]);

  // On mount + auto-refresh every 5 min
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // When month changes, only refetch month data (not the 6-month series)
  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  return {
    monthData,
    monthlySeries,
    loading,
    error,
    lastUpdated,
    selectedMonth,
    setSelectedMonth,
    refetch: fetchAll,
  };
}
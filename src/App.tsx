import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap"; // Simplified imports
import TripForm from "./components/TripForm";
import ResultsSection from "./components/ResultsSection"; // Import ResultsSection
import { Location, Trip, RouteStop, DailyLog } from "./types";
import "./App.css";
import Header from "./components/Header";
import { apiRequest } from './services/api';

const App: React.FC = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [routeData, setRouteData] = useState<any | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeLog, setActiveLog] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Get CSRF token on component mount
  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift() || null;
        return cookieValue;
      }
      return null;
    };

    const token = getCookie("csrftoken");
    setCsrfToken(token);

    if (!token) {
      fetch("/api-auth/login/", { method: "GET", credentials: "include" })
        .then(() => {
          const newToken = getCookie("csrftoken");
          setCsrfToken(newToken);
        })
        .catch((err) => {
          console.error("Error fetching CSRF token:", err);
        });
    }
  }, []);

  const handleTripSubmit = async (
    currentLocation: Location,
    pickupLocation: Location,
    dropoffLocation: Location,
    cycleHours: number,
    timezone: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      };
      if (csrfToken) headers["X-CSRFToken"] = csrfToken;

      const tripResponse = await apiRequest("/api/trips/", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          current_location: currentLocation.id,
          pickup_location: pickupLocation.id,
          dropoff_location: dropoffLocation.id,
          current_cycle_hours: cycleHours,
          client_timezone: timezone, // Add timezone information
          driver: 1,
          status: "planned",
        }),
      });

      if (!tripResponse.ok) {
        const errorData = await tripResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to create trip: ${tripResponse.status}`);
      }

      const tripData = await tripResponse.json();
      setTrip(tripData);

      const routeResponse = await apiRequest(`/api/trips/${tripData.id}/calculate_route/`, {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        credentials: "include",
      });

      if (!routeResponse.ok) throw new Error("Failed to calculate route");

      const routeData = await routeResponse.json();
      setRouteData(routeData.route);
      setStops(routeData.stops);
      setDailyLogs(routeData.daily_logs);
      if (routeData.daily_logs.length > 0) setActiveLog(0);
    } catch (err) {
      console.error("Error planning trip:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogChange = (index: number) => {
    setActiveLog(index);
  };

  return (
    <div>
      <Header onTripSubmit={handleTripSubmit} loading={loading} />
      <ResultsSection
        stops={stops}
        error={error}
        loading={loading}
        routeData={routeData}
        trip={trip}
        dailyLogs={dailyLogs}
        activeLog={activeLog}
        handleLogChange={handleLogChange}
      />
    </div>
  );
};

export default App;
import React from "react";
import { Badge } from "react-bootstrap"; // Keep Badge for simplicity
import { Trip, RouteStop } from "../types";

interface TripSummaryProps {
  trip: Trip;
  routeData: any;
  stops: RouteStop[];
}

const TripSummary: React.FC<TripSummaryProps> = ({ trip, routeData, stops }) => {
  if (!trip || !routeData) {
    return null;
  }

  const formatDistance = (miles: number) => {
    return `${Math.round(miles)} mi`;
  };

  const formatDuration = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const getTotalDrivingTime = () => {
    let drivingHours = 0;
    if (routeData) {
      drivingHours = routeData.duration_hours;
    }
    return formatDuration(drivingHours);
  };

  const getTotalRestTime = () => {
    let restHours = 0;
    stops.forEach((stop) => {
      if (stop.stop_type === "rest" || stop.stop_type === "sleep") {
        const arrivalTime = new Date(stop.arrival_time);
        const departureTime = new Date(stop.departure_time);
        const durationHours = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60 * 60);
        restHours += durationHours;
      }
    });
    return formatDuration(restHours);
  };

  const getServiceHours = () => {
    let serviceHours = 0;
    stops.forEach((stop) => {
      if (stop.stop_type === "pickup" || stop.stop_type === "dropoff" || stop.stop_type === "fuel") {
        const arrivalTime = new Date(stop.arrival_time);
        const departureTime = new Date(stop.departure_time);
        const durationHours = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60 * 60);
        serviceHours += durationHours;
      }
    });
    return formatDuration(serviceHours);
  };

  const getTripDuration = () => {
    if (stops.length === 0) return "N/A";
    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];
    const startTime = new Date(firstStop.arrival_time);
    const endTime = new Date(lastStop.departure_time);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return formatDuration(durationHours);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "primary";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-gray-200 mb-4 shadow-xl rounded-xl overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-gray-800">Trip Summary</h4>
        <Badge bg={getStatusColor(trip.status)} className="text-sm font-medium px-3 py-1">
          {trip.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      {/* Card Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route Details */}
        <div>
          <h5 className="text-lg font-medium text-gray-900 mb-3">Route Details</h5>
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-gray-700">
              <tbody>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Total Distance</th>
                  <td className="px-4 py-2">{formatDistance(routeData.distance_miles)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Total Duration</th>
                  <td className="px-4 py-2">{getTripDuration()}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Driving Time</th>
                  <td className="px-4 py-2">{getTotalDrivingTime()}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Rest Time</th>
                  <td className="px-4 py-2">{getTotalRestTime()}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Service Time</th>
                  <td className="px-4 py-2">{getServiceHours()}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Total Stops</th>
                  <td className="px-4 py-2">{stops.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trip Details */}
        <div>
          <h5 className="text-lg font-medium text-gray-900 mb-3">Trip Details</h5>
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-gray-700">
              <tbody>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Trip ID</th>
                  <td className="px-4 py-2">{trip.id}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Current Location</th>
                  <td className="px-4 py-2">{trip.current_location_details?.name || "Unknown"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Pickup Location</th>
                  <td className="px-4 py-2">{trip.pickup_location_details?.name || "Unknown"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Dropoff Location</th>
                  <td className="px-4 py-2">{trip.dropoff_location_details?.name || "Unknown"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Created</th>
                  <td className="px-4 py-2">{formatDateTime(trip.created_at)}</td>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Updated</th>
                  <td className="px-4 py-2">{formatDateTime(trip.updated_at)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripSummary;
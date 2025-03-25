import React, { useEffect, useRef } from "react";
import { Card, Container } from "react-bootstrap";
import StopsList from "./StopsList";
import RouteMap from "./RouteMap";
import TripSummary from "./TripSummary";
import LogViewer from "./LogViewer";
import { RouteStop, Trip, DailyLog } from "../types";

interface ResultsSectionProps {
  stops: RouteStop[];
  error: string | null;
  loading: boolean;
  routeData: any;
  trip: Trip | null;
  dailyLogs: DailyLog[];
  activeLog: number;
  handleLogChange: (index: number) => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  stops = [],
  error = null,
  loading = false,
  routeData = null,
  trip = null,
  dailyLogs = [],
  activeLog = 0,
  handleLogChange = () => {},
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      (stops.length > 0 || routeData || dailyLogs.length > 0) &&
      !loading &&
      resultsRef.current
    ) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        resultsRef.current?.classList.add("animate-pulse");
        setTimeout(
          () => resultsRef.current?.classList.remove("animate-pulse"),
          1500
        );
      }, 300);
    }
  }, [stops, routeData, dailyLogs, loading]);

  return (
    <div className="relative">
      <div
        ref={resultsRef}
        className="mt-12 transition-all duration-500 px-4 md:px-8 pt-16"
      >
        {/* Trip Summary and Route Stops and Map */}
        {trip && routeData && (
          <div className="flex flex-col md:flex-row mb-6 gap-6 h-full">
            <div className="w-full md:w-1/3 h-full flex-grow">
              <Card className="h-full bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md flex flex-col">
                <Card.Header className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 px-4 py-3">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                    </svg>
                    Route Stops
                  </h4>
                </Card.Header>
                <Card.Body className="p-4 flex-grow">
                  <StopsList stops={stops} />
                </Card.Body>
              </Card>
            </div>
            <div className="w-full md:w-2/3 h-full">
              <div className="flex flex-col">
                <TripSummary trip={trip} routeData={routeData} stops={stops} />
                <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md">
                  <Card.Header className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 px-4 py-3">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        ></path>
                      </svg>
                      Route Visualization
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <RouteMap routeData={routeData} stops={stops} />
                  </Card.Body>
                </Card>
              </div>
              {/* Daily Logs */}
              {dailyLogs.length > 0 && (
                  <Card className="bg-white border mt-4 border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6 transition-all hover:shadow-md max-w-3/4 mx-auto">
                    <Card.Header className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 px-4 py-3">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          ></path>
                        </svg>
                        Daily Logs
                      </h4>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <LogViewer
                        logs={dailyLogs}
                        activeLog={activeLog}
                        onLogChange={handleLogChange}
                        trip={trip}
                      />
                    </Card.Body>
                  </Card>
                )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center p-8 bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-lg text-gray-600">
                Calculating optimal route and generating logs...
              </span>
            </div>
            <p className="mt-4 text-gray-400">
              This may take a moment depending on route complexity
            </p>
          </div>
        )}

        {/* Back to Top Button */}
        <div className="sticky bottom-6 flex justify-end">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
import React, { useState, useEffect } from "react";
import { Location } from "../types";
import LocationMapPicker from "./LocationMapPicker";

interface TripFormProps {
  onSubmit: (
    currentLocation: Location,
    pickupLocation: Location,
    dropoffLocation: Location,
    cycleHours: number
  ) => void; // Changed to void to match Header's expectation
  loading: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, loading }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [cycleHours, setCycleHours] = useState<number>(0);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [pickerMode, setPickerMode] = useState<"current" | "pickup" | "dropoff">("current");
  const [pickerTitle, setPickerTitle] = useState<string>("");
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const response = await fetch("/api/locations/");
        if (!response.ok) throw new Error("Failed to fetch locations");
        const data = await response.json();
        setLocations(data);

        if (data.length > 0) {
          setCurrentLocation(data[0]);
          setPickupLocation(data.length > 1 ? data[1] : data[0]);
          setDropoffLocation(data.length > 2 ? data[2] : data[0]);
        }
      } catch (err) {
        setError("Failed to load locations. Please try again later.");
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentLocation || !pickupLocation || !dropoffLocation) {
      setError("Please select valid locations");
      return;
    }

    if (cycleHours < 0 || cycleHours > 70) {
      setError("Cycle hours must be between 0 and 70");
      return;
    }

    setError(null);
    onSubmit(currentLocation, pickupLocation, dropoffLocation, cycleHours);
  };

  const openMapPicker = (mode: "current" | "pickup" | "dropoff") => {
    const titles = {
      current: "Select Current Location",
      pickup: "Select Pickup Location",
      dropoff: "Select Dropoff Location",
    };

    const location = {
      current: currentLocation,
      pickup: pickupLocation,
      dropoff: dropoffLocation,
    }[mode];

    setPickerMode(mode);
    setPickerTitle(titles[mode]);
    setEditingLocation(location);
    setShowMapPicker(true);
  };

  const handleLocationSelected = (location: Location) => {
    if (!locations.find((loc) => loc.id === location.id)) {
      setLocations([...locations, location]);
    }

    const setters = {
      current: setCurrentLocation,
      pickup: setPickupLocation,
      dropoff: setDropoffLocation,
    };

    setters[pickerMode](location);
  };

  if (loadingLocations) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div id="trip-form" className="relative z-10">
      <div className="absolute -top-32 left-0 right-0 h-32 bg-gradient-to-b from-gray-900/80 via-gray-900/20 to-transparent"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-3xl border border-gray-700/30 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-1">
            <div className="bg-gray-900/80 p-6">
              <h2 className="text-3xl font-bold text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                  Trip Planner
                </span>
              </h2>
              <p className="text-gray-300 mt-2">
                Optimize your routes with intelligent planning
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 bg-red-900/30 border-l-4 border-red-400 text-red-100 p-4 rounded-r-lg">
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {["current", "pickup", "dropoff"].map((type) => {
                const location = {
                  current: currentLocation,
                  pickup: pickupLocation,
                  dropoff: dropoffLocation,
                }[type as "current" | "pickup" | "dropoff"];

                const setLocation = {
                  current: setCurrentLocation,
                  pickup: setPickupLocation,
                  dropoff: setDropoffLocation,
                }[type as "current" | "pickup" | "dropoff"];

                const label = {
                  current: "Current Location",
                  pickup: "Pickup Location",
                  dropoff: "Dropoff Location",
                }[type as "current" | "pickup" | "dropoff"];

                return (
                  <div key={type} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {label}
                    </label>
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <select
                          value={location?.id || ""}
                          onChange={(e) => {
                            const selected = locations.find(
                              (loc) => loc.id === Number(e.target.value)
                            );
                            if (selected) setLocation(selected);
                          }}
                          className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                          required
                        >
                          <option value="">Select {label.toLowerCase()}</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openMapPicker(
                            type as "current" | "pickup" | "dropoff"
                          )
                        }
                        className="flex items-center justify-center bg-gray-700/50 hover:bg-gray-600/70 text-white px-4 rounded-lg border border-gray-600 transition-all duration-300 hover:shadow-md"
                      >
                        <svg
                          className="w-5 h-5"
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                        </svg>
                        <span className="ml-2 hidden sm:inline">Map</span>
                      </button>
                    </div>
                    {location && (
                      <p className="text-sm text-gray-400 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
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
                        {location.address ||
                          `${location.latitude}, ${location.longitude}`}
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Current Cycle Hours Used
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="70"
                    step="0.5"
                    value={cycleHours}
                    onChange={(e) => setCycleHours(Number(e.target.value))}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <span className="absolute right-3 top-3 text-gray-400">
                    hrs
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Hours of service used in current 8-day cycle (0-70)
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !currentLocation ||
                    !pickupLocation ||
                    !dropoffLocation
                  }
                  className={`w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 ${
                    loading
                      ? "opacity-80 cursor-not-allowed"
                      : "hover:shadow-xl hover:scale-[1.02]"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Planning Trip...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                      Plan My Trip
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <LocationMapPicker
        show={showMapPicker}
        onHide={() => setShowMapPicker(false)}
        onSelectLocation={handleLocationSelected}
        title={pickerTitle}
        initialLocation={editingLocation}
      />
    </div>
  );
};

export default TripForm;
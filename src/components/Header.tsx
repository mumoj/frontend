import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import TripForm from "./TripForm";
import { Location } from "../types";

interface HeaderProps {
  onTripSubmit: (
    currentLocation: Location,
    pickupLocation: Location,
    dropoffLocation: Location,
    cycleHours: number,
    timezone: string
  ) => void;
  loading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onTripSubmit, loading }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`relative min-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden transition-all duration-500 ${
        isScrolled ? "shadow-xl" : ""
      }`}
    >
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/10"
            style={{
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full filter blur-[100px] opacity-30 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-[120px] opacity-20 animate-float delay-1000"></div>
        <div className="absolute bottom-1/3 left-2/3 w-64 h-64 bg-purple-500/5 rounded-full filter blur-[80px] opacity-30 animate-float delay-2000"></div>
      </div>

      <NavBar isScrolled={isScrolled} />

      <div className="container mx-auto px-4 md:px-8 pt-32 pb-32 relative z-10">
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="flex flex-col items-center space-y-6 group">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-300 animate-text-shine">
                Trip Planner
              </span>
              <span className="text-gray-300 mx-2">&</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-blue-400 animate-text-shine delay-200">
                ELD Logger
              </span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-300/90 max-w-3xl leading-relaxed animate-fade-in-up">
            Navigate Smart, Drive Compliant: Your Trip Planning & ELD Solution for Hassle-Free Trucking
          </p>

          <TripForm onSubmit={onTripSubmit} loading={loading} />
        </div>
      </div>
    </header>
  );
};

export default Header;
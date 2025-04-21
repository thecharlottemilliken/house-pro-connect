
import React from "react";
import { Hammer, Home as HomeIcon, MapPin } from "lucide-react";

interface MapPinsOverlayProps {
  jobs: any[];
  activeJobId: string | null;
  onPinClick: (jobId: string) => void;
}

export default function MapPinsOverlay({ jobs, activeJobId, onPinClick }: MapPinsOverlayProps) {
  // Position for central home circle & border
  // Absolute positions based on design
  const hammerPins = [
    { id: "1", left: "63%", top: "26%" },
    { id: "2", left: "70%", top: "34%" },
    { id: "3", left: "61.5%", top: "43%" },
    { id: "4", left: "75%", top: "60%" },
    { id: "5", left: "47%", top: "66%" },
  ];

  return (
    <div className="absolute inset-0 z-20">
      {/* Large faded circle */}
      <div
        style={{
          position: "absolute",
          top: "13.5%",
          left: "16%",
          width: "59%",
          height: "72%",
          borderRadius: "50%",
          border: "2px solid #9b87f5",
          background: "rgba(191, 188, 240, 0.13)",
          boxShadow: "0 0 32px 5px rgba(155,135,245,0.13)",
        }}
        className="pointer-events-none"
      />
      {/* Center home icon */}
      <div
        style={{
          position: "absolute",
          left: "44.1%",
          top: "47.7%",
          width: 54,
          height: 54,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
          background: "#174c65",
          border: "4px solid #fff",
          boxShadow: "0 2px 10px 0 rgba(0,0,0,0.10)",
          zIndex: 21,
        }}
        className="pointer-events-none"
      >
        <HomeIcon className="w-7 h-7 text-white" strokeWidth={2.4} />
      </div>
      {/* Hammer job pins */}
      {hammerPins.map((pin, idx) => {
        const isActive = pin.id === activeJobId;
        return (
          <div
            key={idx}
            onClick={() => onPinClick(pin.id)}
            style={{
              position: "absolute",
              left: pin.left,
              top: pin.top,
              width: isActive ? 46 : 38,
              height: isActive ? 46 : 38,
              borderRadius: "50%",
              background: isActive ? "#FFD6BC" : "#FDE1D3",
              border: `3px solid ${isActive ? "#E05E00" : "#F97316"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isActive 
                ? "0 2px 15px 2px rgba(249,115,22,0.25)" 
                : "0 2px 10px 0 rgba(0,0,0,0.11)",
              zIndex: isActive ? 22 : 20,
              transition: "all 0.2s ease-in-out",
              cursor: "pointer",
            }}
            className="hover:scale-110"
          >
            <Hammer 
              className={`${isActive ? "w-6 h-6" : "w-5 h-5"} text-[#F97316]`} 
              strokeWidth={2.4} 
            />
          </div>
        );
      })}
    </div>
  );
}

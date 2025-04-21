
import React from "react";
import { Hammer, Home as HomeIcon } from "lucide-react";

// Absolute positions based on design (example coordinates for demonstration)
const hammerPins = [
  { left: "63%", top: "26%" },
  { left: "70%", top: "34%" },
  { left: "61.5%", top: "43%" },
  { left: "75%", top: "60%" },
  { left: "47%", top: "66%" },
];

export default function MapPinsOverlay() {
  // Position for central home circle & border
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
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
      >
        <HomeIcon className="w-7 h-7 text-white" strokeWidth={2.4} />
      </div>
      {/* Hammer job pins */}
      {hammerPins.map((pin, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: pin.left,
            top: pin.top,
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#FDE1D3",
            border: "3px solid #F97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px 0 rgba(0,0,0,0.11)",
            zIndex: 20,
          }}
        >
          <Hammer className="w-5 h-5 text-[#F97316]" strokeWidth={2.4} />
        </div>
      ))}
    </div>
  );
}

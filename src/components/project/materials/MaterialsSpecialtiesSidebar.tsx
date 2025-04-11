
import React from "react";

interface MaterialsSpecialtiesSidebarProps {
  activeSpecialty: string;
  setActiveSpecialty: (specialty: string) => void;
}

const specialties = [
  "Tile",
  "Electric",
  "Paint",
  "Plumbing",
  "Flooring",
  "Windows",
  "Insulation",
  "Cabinets",
  "Countertops",
  "Appliances"
];

const MaterialsSpecialtiesSidebar = ({ 
  activeSpecialty, 
  setActiveSpecialty 
}: MaterialsSpecialtiesSidebarProps) => {
  return (
    <div className="w-64 min-w-64 border-r border-gray-200 bg-gray-50 overflow-auto hidden md:block">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-800">Specialties</h2>
      </div>
      <nav>
        <ul>
          {specialties.map((specialty) => (
            <li key={specialty}>
              <button
                onClick={() => setActiveSpecialty(specialty)}
                className={`w-full text-left p-4 hover:bg-gray-100 ${
                  activeSpecialty === specialty ? "bg-gray-100" : ""
                }`}
              >
                {specialty}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default MaterialsSpecialtiesSidebar;

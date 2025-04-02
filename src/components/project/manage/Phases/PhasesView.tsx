
import { Button } from "@/components/ui/button";
import PhaseCard, { Phase } from "./PhaseCard";

const PhasesView = () => {
  // Define phases data
  const phases: Phase[] = [
    {
      id: 1,
      name: "Planning & Design",
      status: "Completed",
      tasks: [
        { id: 1, name: "Initial Consultation", status: "Completed", date: "Jan 10, 2024" },
        { id: 2, name: "Site Assessment", status: "Completed", date: "Jan 12, 2024" },
        { id: 3, name: "Design Concept Approval", status: "Completed", date: "Jan 15, 2024" }
      ],
      startDate: "Jan 10, 2024",
      endDate: "Jan 15, 2024"
    },
    {
      id: 2,
      name: "Demolition",
      status: "In Progress",
      tasks: [
        { id: 4, name: "Remove Old Fixtures", status: "Completed", date: "Jan 18, 2024" },
        { id: 5, name: "Wall Demolition", status: "In Progress", date: "Jan 21, 2024" },
        { id: 6, name: "Floor Removal", status: "Not Started", date: "Jan 23, 2024" }
      ],
      startDate: "Jan 18, 2024",
      endDate: "Jan 25, 2024"
    },
    {
      id: 3,
      name: "Rough Construction",
      status: "Upcoming",
      tasks: [
        { id: 7, name: "Framing", status: "Not Started", date: "Jan 26, 2024" },
        { id: 8, name: "Electrical Rough-In", status: "Not Started", date: "Jan 28, 2024" },
        { id: 9, name: "Plumbing Rough-In", status: "Not Started", date: "Jan 30, 2024" }
      ],
      startDate: "Jan 26, 2024",
      endDate: "Feb 5, 2024"
    },
    {
      id: 4,
      name: "Finishing",
      status: "Upcoming",
      tasks: [
        { id: 10, name: "Drywall Installation", status: "Not Started", date: "Feb 6, 2024" },
        { id: 11, name: "Cabinet Installation", status: "Not Started", date: "Feb 10, 2024" },
        { id: 12, name: "Flooring Installation", status: "Not Started", date: "Feb 14, 2024" }
      ],
      startDate: "Feb 6, 2024",
      endDate: "Feb 20, 2024"
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Project Phases</h2>
        <Button className="bg-[#0f566c] hover:bg-[#0d4a5d]">
          ADD PHASE
        </Button>
      </div>
      
      <div className="space-y-6">
        {phases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>
    </>
  );
};

export default PhasesView;

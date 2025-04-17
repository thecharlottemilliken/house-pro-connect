
import { useIsMobile } from "@/hooks/use-mobile";

interface Step {
  number: number;
  title: string;
  current: boolean;
}

interface CreateProjectStepsProps {
  steps: Step[];
}

const CreateProjectSteps = ({ steps }: CreateProjectStepsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'w-full' : 'w-80'} bg-[#EFF3F7] p-4 md:p-8`}>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Create a Project</h1>
      <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
        Lorem ipsum dolor sit amet consectetur.
      </p>
      
      <div className="space-y-4 md:space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start">
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-2 md:mr-3 ${
              step.current ? "bg-[#174c65] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {step.number}
            </div>
            <div>
              <h3 className={`text-sm md:text-base font-medium ${
                step.current ? "text-[#174c65]" : "text-gray-500"
              }`}>
                Step {step.number}
              </h3>
              <p className={`text-xs md:text-sm ${
                step.current ? "text-black" : "text-gray-500"
              }`}>
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateProjectSteps;

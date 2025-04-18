
import React from "react";
import { LucideProps } from "lucide-react";

export const PinterestLogo = ({ size = 24, color = "currentColor", ...props }: LucideProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.1 2.5 7.6 6 9.2 0-.7 0-1.5.2-2.3.2-.8 1.4-5.4 1.4-5.4s-.3-.7-.3-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-.9 3.8-.3 1.1.5 2 1.6 2 1.9 0 3.2-2.5 3.2-5.4 0-2.2-1.5-3.9-4.2-3.9-3.1 0-5 2.3-5 4.8 0 .9.3 1.5.7 2 .1.1.2.2.1.5 0 .2-.1.6-.2.8-.1.2-.2.3-.4.2-1.4-.6-2-2.1-2-3.8 0-2.8 2.4-6.1 7-6.1 3.7 0 6.2 2.7 6.2 5.6 0 3.8-2.1 6.7-5.2 6.7-1 0-2-.6-2.3-1.2 0 0-.5 2.1-.7 2.5-.2.7-.6 1.4-1 2 .9.3 1.8.4 2.8.4 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
};

export default PinterestLogo;

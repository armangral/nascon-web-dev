import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  className?: string;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = "bg-blue-600",
  height = 8,
  className = "",
  showPercentage = false,
}) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-end mb-1">
          <span className="text-xs font-medium text-gray-700">
            {Math.round(safeProgress)}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full h-${height / 2}`}
        style={{ height: `${height}px` }}
      >
        <motion.div
          className={`${color} h-full rounded-full transition-all`}
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

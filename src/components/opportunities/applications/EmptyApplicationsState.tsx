
import React from "react";

const EmptyApplicationsState = () => {
  return (
    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
      <h3 className="text-lg font-medium mb-2">No applications submitted</h3>
      <p className="text-gray-500">Run clubs haven't applied to this opportunity yet</p>
    </div>
  );
};

export default EmptyApplicationsState;

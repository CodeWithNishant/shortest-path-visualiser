// src/components/ui/card.js (or your file path)

import React from "react";

// Card wrapper component
export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg ${
        // Updated classes
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card header component
export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div
      // Using flex to allow for title and potential actions/description more easily.
      // p-4 sm:p-6 provides responsive padding.
      className={`flex flex-col space-y-1.5 p-4 sm:p-6 ${
        // Updated classes
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card title component
export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3
      // Adjusted text size and color to match previous UI updates for consistency.
      className={`text-lg sm:text-xl font-semibold leading-none tracking-tight text-slate-700 ${
        // Updated classes
        className || ""
      }`}
      {...props}
    >
      {children}
    </h3>
  );
};

// Card description component (NEW - common and useful)
export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p
      className={`text-sm text-slate-500 ${
        // Classes for description
        className || ""
      }`}
      {...props}
    >
      {children}
    </p>
  );
};

// Card content component
export const CardContent = ({ className, children, ...props }) => {
  return (
    // Consistent responsive padding.
    // If a CardHeader is used and has bottom padding from p-4/p-6,
    // you might want to add 'pt-0' to className for specific instances
    // to avoid double vertical padding, e.g. className="pt-0"
    <div className={`p-4 sm:p-6 ${className || ""}`} {...props}>
      {" "}
      {/* Updated classes */}
      {children}
    </div>
  );
};

// Card footer component
export const CardFooter = ({ className, children, ...props }) => {
  return (
    // Flex for aligning items like buttons. Consistent responsive padding.
    <div
      className={`flex items-center p-4 sm:p-6 border-t border-slate-200 ${
        // Updated classes
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

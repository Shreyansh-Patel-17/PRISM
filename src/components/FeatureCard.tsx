import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition">
      {icon && <div className="text-pink-500 text-4xl mb-4">{icon}</div>}
      <h3 className="font-bold text-lg text-pink-600 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

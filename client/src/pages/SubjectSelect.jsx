import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const SubjectSelect = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSelect = (subject) => {
    navigate(`/dashboard?subject=${subject}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Welcome, {user?.fullName || 'Student'}!
        </h1>
        <p className="text-slate-600 mt-2 text-base sm:text-lg">
          Choose a subject to begin your practice and diagnostic tests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Math Card */}
        <div
          onClick={() => handleSelect('Math')}
          className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-900 p-8 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
              📐
            </div>
            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-900 mb-2">
              Mathematics
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Master Fractions, Decimals, Algebraic Equations, and Geometry through step-by-step adaptive practice.
            </p>
          </div>
          <div className="flex items-center text-blue-900 font-semibold text-sm">
            <span>Enter Math Portal</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* Science Card */}
        <div
          onClick={() => handleSelect('Science')}
          className="bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-700 p-8 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
              🔬
            </div>
            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-teal-700 mb-2">
              Science
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Explore Photosynthesis, Forces & Motion, Cell Biology, and Matter with real-time feedback.
            </p>
          </div>
          <div className="flex items-center text-teal-700 font-semibold text-sm">
            <span>Enter Science Portal</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

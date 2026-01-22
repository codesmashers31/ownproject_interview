import React, { useState, useEffect } from "react";
import { CheckCircle, ArrowRight, Play } from "lucide-react";

const roles = [
  { text: "Interview Coach" },
  { text: "Career Mentor" },
  { text: "Placement Partner" },
  { text: "Tech Expert" },
  { text: "HR Specialist" }
];

const companies = ["Zoho", "Infosys", "TCS", "Wipro", "Cognizant", "Accenture"];

const ModernHeroBanner = () => {
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Soft Glow Effect Removed */}

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Main Hero Content */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <h1 className="text-7xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
            <span className="text-gray-900">Your AI-Powered</span>
            <br />
            <span className="relative inline-block mt-2">
              {roles.map((role, idx) => (
                <span
                  key={idx}
                  className={`absolute inset-0 text-gray-900 transition-all duration-700 ${idx === currentRole ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
                    }`}
                >
                  {role.text}
                </span>
              ))}
              <span className="opacity-0">{roles[0].text}</span>
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Master interviews with AI-powered mock sessions and real HR practice.
            Get placed faster at top companies.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["AI Feedback", "Real HR Practice", "24/7 Available", "Company-Specific Prep"].map((feature, idx) => (
              <div key={idx} className="px-5 py-2.5 bg-blue-50 border border-blue-100 rounded-full text-sm text-[#004fcb] hover:bg-blue-100 transition-all duration-300">
                <CheckCircle className="w-4 h-4 inline mr-2 text-[#004fcb]" />
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
            <button className="group px-10 py-5 bg-[#004fcb] text-white rounded-2xl font-semibold text-lg hover:bg-[#003bb5] transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-900/20">
              Start Free Mock Interview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-lg hover:bg-blue-50 hover:border-[#004fcb] hover:text-[#004fcb] transition-all flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Companies Marquee */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider">Students placed at top companies</p>
            <div className="flex flex-wrap justify-center gap-10 items-center">
              {companies.map((company, idx) => (
                <div key={idx} className="text-xl font-semibold text-gray-400 hover:text-[#004fcb] transition-colors cursor-default">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="text-xs text-[#004fcb] font-semibold mb-1 uppercase tracking-wider">Ready to get started?</div>
              <h3 className="text-xl font-bold mb-1 text-gray-900">Chennai's #1 <span className="text-[#004fcb]">Interview Prep Platform</span></h3>
              <p className="text-gray-600 text-sm">Join thousands who landed their dream jobs</p>
            </div>
            <button className="whitespace-nowrap px-6 py-3 bg-[#004fcb] text-white rounded-xl font-semibold text-sm hover:bg-[#003bb5] transition-all hover:scale-105 flex items-center gap-2 shadow-md shadow-blue-900/10">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHeroBanner;
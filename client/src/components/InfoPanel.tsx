import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowRight, Shield, BookOpen, Lightbulb } from "lucide-react";

const mockStatus = [
  "Actively booking mocks",
  "Preparing for mock sessions",
  "Scheduled for a mock",
  "Received mock feedback",
  "Just exploring mock interviews",
  "Not interested in mocks"
];

const InfoPanel = () => (
  <div className="space-y-4">
    {/* Mock Journey Card - Aligned with CoachSessionCard style */}
    <Card className="group bg-white rounded-xl border border-gray-200 hover:border-[#004fcb] transition-all duration-300 relative shadow-sm hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
            Your Journey
          </span>
        </div>
        <CardTitle className="text-base font-bold text-gray-900 mt-0.5">
          Where are you in your mock interview journey?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-5 pb-5">
        {mockStatus.map((status, index) => (
          <button
            key={index}
            className="w-full py-2.5 px-4 text-xs font-bold border border-gray-200 hover:border-[#004fcb] rounded-lg bg-gray-50 hover:bg-white text-gray-700 hover:text-[#004fcb] transition-all duration-200 flex items-center gap-3 group/btn"
          >
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover/btn:bg-[#004fcb] transition-colors duration-200"></div>
            <span className="text-left flex-1">{status}</span>
          </button>
        ))}
      </CardContent>
    </Card>

    {/* Safety & Privacy Card */}
    <Card className="group bg-white rounded-xl border border-gray-200 hover:border-[#004fcb] transition-all duration-300 relative shadow-sm hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
          <Shield className="w-5 h-5 text-gray-700 group-hover:text-[#004fcb]" />
        </div>
        <div>
          <div className="font-bold text-sm text-gray-900 mb-1">
            Safe & Secure
          </div>
          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
            We prioritize your privacy. All sessions are confidential.
          </p>
          <a href="#" className="inline-flex items-center gap-1 text-[#004fcb] text-xs font-bold hover:underline">
            Learn more <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>

    {/* Pro-tip Card */}
    <Card className="group bg-white rounded-xl border border-gray-200 hover:border-[#004fcb] transition-all duration-300 relative shadow-sm hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
          <Lightbulb className="w-5 h-5 text-gray-700 group-hover:text-[#004fcb]" />
        </div>
        <div>
          <div className="font-bold text-sm text-gray-900 mb-1">
            Interview Tip
          </div>
          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
            Structure your answers with the STAR method for best results.
          </p>
          <a href="#" className="inline-flex items-center gap-1 text-[#004fcb] text-xs font-bold hover:underline">
            Read guide <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>

    {/* Resources Card */}
    <Card className="group bg-white rounded-xl border border-gray-200 hover:border-[#004fcb] transition-all duration-300 relative shadow-sm hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
            <BookOpen className="w-5 h-5 text-gray-700 group-hover:text-[#004fcb]" />
          </div>
          <div className="font-bold text-sm text-gray-900">Preparation Steps</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="#"
            className="px-3 py-2 rounded-lg border border-gray-200 hover:border-[#004fcb] text-xs font-bold text-gray-700 hover:text-[#004fcb] text-center transition-all bg-gray-50 hover:bg-white"
          >
            Questions
          </a>
          <a
            href="#"
            className="px-3 py-2 rounded-lg border border-gray-200 hover:border-[#004fcb] text-xs font-bold text-gray-700 hover:text-[#004fcb] text-center transition-all bg-gray-50 hover:bg-white"
          >
            Guides
          </a>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const SkeletonInfoPanel = () => (
  <div className="space-y-4 animate-pulse">
    {/* Mock Journey Card Skeleton */}
    <div className="rounded-xl border border-gray-200 bg-white h-64 p-5 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-8 bg-gray-100 rounded w-full"></div>
        ))}
      </div>
    </div>

    {/* Safety Card Skeleton */}
    <div className="rounded-xl border border-gray-200 bg-white h-24 p-5 flex gap-4">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

export default InfoPanel;

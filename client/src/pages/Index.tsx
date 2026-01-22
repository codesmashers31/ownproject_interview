import Navigation from "../components/Navigation";
import Sidebar, { SkeletonSidebar } from "../components/Sidebar";
import CoachSessionCard from "../components/CoachSessionCard";
import InfoPanel, { SkeletonInfoPanel } from "../components/InfoPanel";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const showProfile = !!user?.id;
  const showSkeletons = isLoading; // Show skeletons while checking auth status

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navigation />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar */}
          {(showProfile || showSkeletons) && (
            <aside className="hidden xl:col-span-3 lg:col-span-3 lg:block">
              <div className="sticky top-20 space-y-4">
                {showSkeletons ? <SkeletonSidebar /> : (showProfile && <Sidebar />)}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <section className={`col-span-12 ${(showProfile || showSkeletons)
            ? 'lg:col-span-6 xl:col-span-6'
            : 'lg:col-span-10 lg:col-start-2 xl:col-span-8 xl:col-start-3'
            } space-y-6`}>
            <CoachSessionCard />
          </section>

          {/* Right Sidebar */}
          {(showProfile || showSkeletons) && (
            <aside className="hidden xl:col-span-3 lg:col-span-3 lg:block">
              <div className="sticky top-20 space-y-6">
                {showSkeletons ? <SkeletonInfoPanel /> : (showProfile && <InfoPanel />)}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <BottomNav />

      {/* Footer is usually strictly at bottom, can be outside main flex-1 */}
      <Footer />
    </div>
  );
};
export default Index;

import Sidebar from "@/components/Sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-white -mx-6 -mb-10 md:h-screen md:mx-0 md:mb-0">

      <Sidebar />

      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        {children}
      </div>

    </div>
  );
}
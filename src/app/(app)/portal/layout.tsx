import Sidebar from "@/components/Sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">

      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}
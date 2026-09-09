import Sidebar from "@/components/Sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">

      <Sidebar />

      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        {children}
      </div>

    </div>
  );
}
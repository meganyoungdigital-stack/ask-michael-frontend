import Sidebar from "@/components/Sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">

      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}
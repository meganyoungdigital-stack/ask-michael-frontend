import Sidebar from "@/components/Sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] mt-16">

      <Sidebar />

      <div className="flex-1 overflow-hidden">
        {children}
      </div>

    </div>
  );
}
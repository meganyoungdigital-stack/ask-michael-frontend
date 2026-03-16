import Sidebar from "@/components/Sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">

      <Sidebar />

      <main className="flex-1 h-screen overflow-y-auto bg-black">
        {children}
      </main>

    </div>
  );
}
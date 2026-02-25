import Sidebar from "@/components/Sidebar";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
      <div style={{ width: "250px", background: "red" }}>
        TEST SIDEBAR
      </div>

      <div style={{ flex: 1, background: "blue" }}>
        {children}
      </div>
    </div>
  );
}
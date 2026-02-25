import Sidebar from "@/components/Sidebar";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 64px)", // account for header
      }}
    >
      {/* Sidebar */}
      <Sidebar conversations={[]} activeId="" />

      {/* Chat Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
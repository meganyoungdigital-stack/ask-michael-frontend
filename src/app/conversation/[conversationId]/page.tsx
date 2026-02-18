interface PageProps {
  params: {
    conversationId: string;
  };
}

export default function ConversationPage({ params }: PageProps) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Conversation ID:</h1>
      <p>{params.conversationId}</p>
    </div>
  );
}

export default function TestPage({
  params,
}: {
  params: { page: string };
}) {
  return (
    <div style={{ padding: 40 }}>
      <h1>Dynamic route working</h1>
      <p>Page slug: {params.page}</p>
    </div>
  );
}
export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="flex flex-col items-center justify-center h-screen text-white bg-gray-900">
      <h1 className="text-4xl font-bold">Study Page {id}</h1>
      <p className="mt-4 text-lg text-gray-300">
        You clicked on carousel item #{id}.
      </p>
    </main>
  );
}

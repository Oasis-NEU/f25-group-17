export default function StudyPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-white bg-gray-900">
      <h1 className="text-4xl font-bold">Study Page {params.id}</h1>
      <p className="mt-4 text-lg text-gray-300">
        You clicked on carousel item #{params.id}.
      </p>
    </main>
  );
}
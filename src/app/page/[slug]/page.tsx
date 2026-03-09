import { pages } from "../../../data/pages"
import BackHome from "../../../components/BackHome"

export default function Page({ params }: { params: { slug: string } }) {

  const page = pages[params.slug as keyof typeof pages]

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Page not found
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">

      <BackHome />

      <h1 className="text-4xl font-bold mb-8">
        {page.title}
      </h1>

      <div className="text-gray-700 whitespace-pre-line leading-relaxed">
        {page.content}
      </div>

    </div>
  )
}
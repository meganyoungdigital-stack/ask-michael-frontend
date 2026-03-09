import Link from "next/link"

export default function BackHome() {
  return (
    <Link
      href="/"
      className="text-blue-500 hover:underline mb-10 inline-block"
    >
      ← Back to Home
    </Link>
  )
}
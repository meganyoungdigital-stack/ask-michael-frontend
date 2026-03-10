"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export default function Footer() {

  return (

<footer className="relative bg-black text-gray-300 overflow-hidden border-t border-gray-800">

<div className="absolute inset-0 opacity-30 bg-gradient-to-t from-purple-900 via-blue-900 to-black blur-3xl"></div>

<motion.div
  className="absolute -top-40 left-1/2 w-[800px] h-[800px] bg-purple-600 rounded-full opacity-20 blur-[200px]"
  animate={{ scale: [1,1.2,1] }}
  transition={{ duration: 8, repeat: Infinity }}
/>

<div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-10">

{/* Logo */}

<div>

<div className="flex items-center gap-3 mb-4">

<Image
src="/m-logo.png"
alt="Ask Michael Logo"
width={36}
height={36}
/>

<h2 className="text-white text-xl font-semibold">
Ask Michael
</h2>

</div>

<p className="text-sm text-gray-400">
Industrial AI intelligence for engineering knowledge,
procedures and operational decision support.
</p>

<div className="mt-4 text-sm">
<a
href="mailto:askmichael@askmichaelai.org"
className="hover:text-white"
>
askmichael@askmichaelai.org
</a>
</div>

</div>

{/* Platform */}

<div>

<h3 className="text-white font-semibold mb-4">Platform</h3>

<ul className="space-y-2 text-sm">

<li>
<Link href="/app" className="hover:text-white">
Ask Michael
</Link>
</li>

<li>
<Link href="/knowledge-engineering" className="hover:text-white">
AI Knowledge Engineering
</Link>
</li>

<li>
<Link href="/industrial-procedures" className="hover:text-white">
Industrial Procedures
</Link>
</li>

<li>
<Link href="/maintenance-intelligence" className="hover:text-white">
Maintenance Intelligence
</Link>
</li>

</ul>

</div>

{/* Solutions */}

<div>

<h3 className="text-white font-semibold mb-4">Solutions</h3>

<ul className="space-y-2 text-sm">

<li>
<Link href="/pricing" className="hover:text-white">
Pricing
</Link>
</li>

<li>
<Link href="/contact" className="hover:text-white">
Contact
</Link>
</li>

</ul>

</div>

{/* Legal */}

<div>

<h3 className="text-white font-semibold mb-4">Legal</h3>

<ul className="space-y-2 text-sm">

<li>
<Link href="/terms" className="hover:text-white">
Terms
</Link>
</li>

<li>
<Link href="/privacy" className="hover:text-white">
Privacy
</Link>
</li>

<li>
<Link href="/ai-policy" className="hover:text-white">
AI Policy
</Link>
</li>

</ul>

</div>

</div>

<div className="relative border-t border-gray-800 text-center text-xs text-gray-500 py-6">

© {new Date().getFullYear()} Ask Michael AI

<br/>

AI responses are generated automatically and should be
verified before use in operational environments.

</div>

</footer>

  )
}
"use client"

import { motion } from "framer-motion"

export default function Footer() {

  return (

<footer className="relative bg-black text-gray-300 overflow-hidden border-t border-gray-800">

{/* animated gradient background */}
<div className="absolute inset-0 opacity-30 bg-gradient-to-t from-purple-900 via-blue-900 to-black blur-3xl"></div>

{/* animated glow */}
<motion.div
  className="absolute -top-40 left-1/2 w-[800px] h-[800px] bg-purple-600 rounded-full opacity-20 blur-[200px]"
  animate={{ scale: [1,1.2,1] }}
  transition={{ duration: 8, repeat: Infinity }}
/>

<div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-10">

{/* Logo */}
<div>
<h2 className="text-white text-xl font-semibold mb-4">
Ask Michael
</h2>

<p className="text-sm text-gray-400">
Industrial AI intelligence for engineering knowledge,
procedures and operational decision support.
</p>

</div>

{/* Platform */}
<div>
<h3 className="text-white font-semibold mb-4">Platform</h3>
<ul className="space-y-2 text-sm">
<li className="hover:text-white cursor-pointer">Ask Michael</li>
<li className="hover:text-white cursor-pointer">Documents</li>
<li className="hover:text-white cursor-pointer">AI Knowledge</li>
</ul>
</div>

{/* Solutions */}
<div>
<h3 className="text-white font-semibold mb-4">Solutions</h3>
<ul className="space-y-2 text-sm">
<li>Engineering Assistance</li>
<li>Industrial Procedures</li>
<li>Maintenance Intelligence</li>
</ul>
</div>

{/* Legal */}
<div>
<h3 className="text-white font-semibold mb-4">Legal</h3>
<ul className="space-y-2 text-sm">
<li className="hover:text-white cursor-pointer">Terms</li>
<li className="hover:text-white cursor-pointer">Privacy</li>
<li className="hover:text-white cursor-pointer">AI Policy</li>
</ul>
</div>

</div>

{/* bottom bar */}

<div className="relative border-t border-gray-800 text-center text-xs text-gray-500 py-6">

© {new Date().getFullYear()} Ask Michael AI

<br/>

AI responses are generated automatically and should be
verified before use in operational environments.

</div>

</footer>

  )
}
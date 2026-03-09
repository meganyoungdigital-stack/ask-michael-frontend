"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function Navbar() {

return (

<motion.nav
initial={{ y: -80, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.6 }}
className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-gray-800"
>

<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

{/* Logo */}

<Link href="/" className="text-white text-lg font-semibold">
Ask Michael
</Link>

{/* Navigation Links */}

<div className="hidden md:flex items-center gap-8 text-sm text-gray-300">

<Link href="/solutions" className="hover:text-white transition">
Solutions
</Link>

<Link href="/app" className="hover:text-white transition">
Platform
</Link>

<Link href="/pricing" className="hover:text-white transition">
Pricing
</Link>

<Link href="/contact" className="hover:text-white transition">
Contact
</Link>

</div>

{/* Login Button */}

<div>

<Link href="/app">

<button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:scale-105 transition">

Login

</button>

</Link>

</div>

</div>

</motion.nav>

)

}
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
}: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold mb-4">
              Upgrade to Pro
            </h2>

            <p className="text-gray-600 mb-6">
              Unlock advanced engineering features including:
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                Image attachments for weld inspection
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                ISO 3834 advisory analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                Pot shell repair guidance
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                Cost estimation tools
              </li>
            </ul>

            {/* CTA */}
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              Upgrade Now
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
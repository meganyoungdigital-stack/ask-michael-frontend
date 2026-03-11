"use client";

import { useState } from "react";

interface DocumentUploadProps {
  conversationId?: string;
}

export default function DocumentUpload({ conversationId }: DocumentUploadProps) {

  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0];

    if (!file || !conversationId) {
      alert("No conversation selected.");
      return;
    }

    setUploading(true);

    try {

      const reader = new FileReader();

      reader.onload = async () => {

        try {

          const res = await fetch("/api/conversation/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationId,
              name: file.name,
              url: reader.result,
              type: file.type,
            }),
          });

          if (!res.ok) throw new Error();

          alert("File attached to conversation.");

        } catch {
          alert("Upload failed.");
        }

        setUploading(false);

      };

      reader.readAsDataURL(file);

    } catch {

      alert("Upload failed.");
      setUploading(false);

    }

  }

  return (

    <label className="cursor-pointer text-blue-600 text-lg px-2 flex items-center">

      {uploading ? "⏳" : "📎"}

      <input
        type="file"
        onChange={handleUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
      />

    </label>

  );

}
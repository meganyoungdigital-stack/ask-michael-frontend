"use client";

import { useState } from "react";

export default function DocumentUpload() {

  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {

      const reader = new FileReader();

      reader.onload = async () => {

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: file.name,
            url: reader.result,
            type: file.type,
          }),
        });

        if (!res.ok) throw new Error();

        alert("Document uploaded successfully.");

        window.location.reload();
      };

      reader.readAsDataURL(file);

    } catch {

      alert("Upload failed.");

    }

    setUploading(false);

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
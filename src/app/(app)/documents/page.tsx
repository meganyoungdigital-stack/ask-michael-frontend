"use client";

import { useEffect, useState } from "react";

interface DocumentItem {
  _id: string;
  name: string;
  url?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    const res = await fetch("/api/documents");
    const data = await res.json();

    setDocuments(data?.documents || []);
  }

  async function uploadDocument(e: any) {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    fetchDocuments();
  }

  return (
    <div className="p-10 max-w-4xl">

      <h1 className="text-3xl font-bold mb-6">
        Document Library
      </h1>

      <input
        type="file"
        onChange={uploadDocument}
        className="mb-6"
      />

      <div className="space-y-3">

        {documents.length === 0 && (
          <p className="text-gray-400">
            No documents uploaded yet
          </p>
        )}

        {documents.map((doc) => (
          <div
            key={doc._id}
            className="border rounded p-3 flex justify-between items-center"
          >
            <span>📄 {doc.name}</span>

            {doc.url && (
              <a
                href={doc.url}
                target="_blank"
                className="text-blue-600 text-sm"
              >
                Open
              </a>
            )}
          </div>
        ))}

      </div>

    </div>
  );
}
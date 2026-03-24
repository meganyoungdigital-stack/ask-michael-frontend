"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Button variant="outline" onClick={handleBack}>
      ← Back
    </Button>
  );
}
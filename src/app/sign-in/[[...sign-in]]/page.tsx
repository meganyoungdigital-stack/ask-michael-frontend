"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      
      {/* TERMS AND CONDITIONS */}
      <div className="mb-6 w-full max-w-[400px]">
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 cursor-pointer"
          />

          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline hover:opacity-80"
            >
              Terms and Conditions
            </Link>
            .
          </span>
        </label>
      </div>

      {/* CLERK LOGIN */}
      {acceptedTerms ? (
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/portal"
          forceRedirectUrl="/portal"
        />
      ) : (
        <div className="w-full max-w-[400px] rounded-lg border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Please accept the Terms and Conditions before signing in.
          </p>
        </div>
      )}
    </div>
  );
}
"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  if (status === "loading") {
    return <p style={{ padding: 40 }}>Loading...</p>;
  }

  return <>{children}</>;
}
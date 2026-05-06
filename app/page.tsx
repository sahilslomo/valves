"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const text = "Faster with NAVIK";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i === text.length) clearInterval(interval);
      }, 100);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  const handleClassSelect = (cls: string) => {
    const targetUrl = `/protected/course/${cls}/subjects`;

    if (session) {
      router.push(targetUrl);
    } else {
      signIn("google", {
        callbackUrl: targetUrl,
        redirect: true,
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-10 px-6 font-mono bg-white text-black">

      {/* HERO (LOGO ON TOP) */}
      <div className="flex flex-col items-center justify-center mb-6">

        {/* BIG SHIP LOGO */}
        <svg
          className="w-20 h-20 md:w-24 md:h-24 mb-4"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path d="M20 70C35 80 65 80 80 70" stroke="black" strokeWidth="2.5" />
          <path d="M50 20V70" stroke="black" strokeWidth="2.5" />
          <path d="M50 25L70 45L50 45Z" stroke="black" strokeWidth="2.5" fill="none" />
          <path d="M50 30L30 50L50 50Z" stroke="black" strokeWidth="2.5" fill="none" />
        </svg>

        {/* TITLE */}
        <h1 className="text-2xl md:text-5xl font-bold text-center tracking-tight">
          Crack MEO Class 4 & Class 2
        </h1>

      </div>

      {/* NAVIK BRAND TEXT */}
      <p className="text-xl md:text-3xl font-semibold text-center mb-12">

        <span className="relative inline-block">

          {/* soft glow */}
          <span className="absolute inset-0 text-black blur-lg opacity-10 scale-110">
            {displayed}
          </span>

          {/* main text */}
          <span className="relative font-bold tracking-[0.18em] text-black">
            {displayed}

            {/* underline accent */}
            <span className="absolute left-0 -bottom-2 w-full h-[2px] bg-black/40 rounded-full"></span>
          </span>

        </span>

      </p>

      {/* BUTTONS */}
      <div className="w-full max-w-md flex flex-col gap-5">

        <button
          onClick={() => handleClassSelect("2")}
          className="bg-black text-white rounded-2xl py-6 text-xl font-bold shadow-md active:scale-95 transition"
        >
          ⚓ MEO Class 2
        </button>

        <button
          onClick={() => handleClassSelect("4")}
          className="bg-black text-white rounded-2xl py-6 text-xl font-bold shadow-md active:scale-95 transition"
        >
          ⚙️ MEO Class 4
        </button>

      </div>

    </main>
  );
}
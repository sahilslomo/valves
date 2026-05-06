import "./globals.css";
import Providers from "././lib/providers";
import Navbar from "././components/Navbar";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f6f8fa] text-black font-mono">

        <Providers>
          <Navbar />

          <main className="pt-20 flex justify-center">
            <div className="w-full max-w-6xl px-4">
              {children}
            </div>
          </main>
        </Providers>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

      </body>
    </html>
  );
}
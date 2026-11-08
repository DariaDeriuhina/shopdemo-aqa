import type { Metadata } from "next";
import "./globals.css";
import { MSWProvider } from "@/mocks/MSWProvider";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ShopDemo - Ecommerce Store",
  description: "A demo ecommerce store for testing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <MSWProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
            </CartProvider>
          </AuthProvider>
        </MSWProvider>
      </body>
    </html>
  );
}

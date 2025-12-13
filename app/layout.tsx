import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNavWrapper } from "@/components/BottomNavWrapper";
import { getMealPlan, getRecipes, getGroceries } from "./actions";
import { calculateShoppingList } from "@/lib/shopping-utils";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kitchen Pal",
  description: "Your kitchen companion",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mealPlan, recipes, groceries] = await Promise.all([
    getMealPlan(),
    getRecipes(),
    getGroceries()
  ]);

  const shoppingList = calculateShoppingList(mealPlan as any, recipes as any, groceries as any);
  const shoppingCount = shoppingList.length;

  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-background pb-20">
          {children}
        </main>
        <BottomNavWrapper shoppingCount={shoppingCount} />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

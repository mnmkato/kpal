import { BottomNavWrapper } from "@/components/BottomNavWrapper";
import { getMealPlan, getRecipes, getGroceries } from "./actions";
import { calculateShoppingList } from "@/lib/shopping-utils";
import { Header } from "@/components/Header";

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
    <>
      <Header />
      <main className="min-h-screen bg-background pb-20">
        {children}
      </main>
      <BottomNavWrapper shoppingCount={shoppingCount} />
    </>
  );
}

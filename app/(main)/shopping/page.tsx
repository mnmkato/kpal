import { getMealPlan, getRecipes, getGroceries, purchaseItem } from '@/app/(main)/actions';
import { ShoppingScreen } from '@/components/ShoppingScreen';
import { calculateShoppingList } from '@/lib/shopping-utils';
import { Category, GroceryItem } from '@/types';

export default async function ShoppingPage() {
    const [mealPlan, recipes, groceries] = await Promise.all([
        getMealPlan(),
        getRecipes(),
        getGroceries()
    ]);

    const shoppingList = calculateShoppingList(mealPlan as any, recipes as any, groceries as any);

    async function handlePurchase(id: string, purchase: Partial<Omit<GroceryItem, 'id'>>) {
        'use server'
        await purchaseItem(id, purchase.name as string, purchase.category as Category);
    }

    return (
        <div className="pb-20 px-4 max-w-lg mx-auto pt-4">
            <ShoppingScreen
                items={shoppingList}
                onPurchase={handlePurchase}
            />
        </div>
    )
}

import { getMealPlan, getRecipes, getGroceries, purchaseItem } from '@/app/actions';
import { ShoppingScreen } from '@/components/ShoppingScreen';
import { calculateShoppingList } from '@/lib/shopping-utils';

export default async function ShoppingPage() {
    const [mealPlan, recipes, groceries] = await Promise.all([
        getMealPlan(),
        getRecipes(),
        getGroceries()
    ]);

    const shoppingList = calculateShoppingList(mealPlan as any, recipes as any, groceries as any);

    async function handlePurchase(name: string) {
        'use server'
        await purchaseItem(name);
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

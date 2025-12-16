import { MealPlan, Recipe, GroceryItem, ShoppingItem } from '@/types';

export function calculateShoppingList(mealPlan: MealPlan, recipes: Recipe[], groceries: GroceryItem[]): ShoppingItem[] {

    const availableIngredients = new Set(
        groceries.filter(g => g.available).map(g => g.id)
    );
    const neededIngredients = new Map<string, Set<string>>();

    Object.values(mealPlan).forEach(dayMeals => {
        Object.values(dayMeals).forEach(recipeId => {
            if (!recipeId) return;
            const recipe = recipes.find(r => r.id === recipeId);
            if (!recipe) return;
            recipe.ingredients.forEach(groceryId => {
                if (!availableIngredients.has(groceryId)) {
                    if (!neededIngredients.has(groceryId)) {
                        neededIngredients.set(groceryId, new Set());
                    }
                    neededIngredients.get(groceryId)!.add(recipe.name);
                }
            });
        });
    });

return Array.from(neededIngredients.entries()).map(([id, recipes]) => {
    const grocery = groceries.find(g => g.id === id);
    return {
        id,
        name: grocery?.name ?? 'Unknown',
        category: grocery?.category ?? 'Other',
        neededFor: [...recipes],
        purchased: false,
    };
});
}
import { MealPlan, Recipe, GroceryItem, ShoppingItem } from '@/types';

export function calculateShoppingList(mealPlan: MealPlan, recipes: Recipe[], groceries: GroceryItem[]): ShoppingItem[] {
    const neededIngredients = new Map<string, Set<string>>();
    const availableIngredients = new Set(
        groceries.filter(g => g.available).map(g => g.name)
    );

    Object.values(mealPlan).forEach(dayMeals => {
        Object.values(dayMeals).forEach(recipeId => {
            if (recipeId) {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    recipe.ingredients.forEach(ing => {
                        if (!availableIngredients.has(ing)) {
                            if (!neededIngredients.has(ing)) {
                                neededIngredients.set(ing, new Set());
                            }
                            neededIngredients.get(ing)!.add(recipe.name);
                        }
                    });
                }
            }
        });
    });

    return Array.from(neededIngredients.entries()).map(([name, recipes]) => {
        const grocery = groceries.find(g => g.name === name);
        return {
            id: `shop-${name}`,
            name,
            neededFor: Array.from(recipes),
            purchased: false,
            category: grocery?.category || 'Other',
            unit: grocery?.unit,
        };
    });
}

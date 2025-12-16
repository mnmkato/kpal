import { Recipe, GroceryItem, RecipeWithStatus } from '@/types';

export function resolveIngredientNames(
  ingredientIds: string[],
  groceries: GroceryItem[]
) {
  const map = new Map(groceries.map(g => [g.id, g.name]));
  return ingredientIds.map(id => map.get(id) ?? 'Unknown');
}

export function calculateRecipeStatus(recipes: Recipe[], groceries: GroceryItem[]): RecipeWithStatus[] {
    const availableIngredients = new Set(
        groceries.filter(g => g.available).map(g => g.id)
    );
    return recipes.map(recipe => {
        const missingIngredients = recipe.ingredients.filter(
            ingId => !availableIngredients.has(ingId)
        );
        
        const missingCount = missingIngredients.length;

        let status: RecipeWithStatus['status'];
        if (missingCount === 0) {
            status = 'READY';
        } else if (missingCount <= 2) {
            status = 'ALMOST';
        } else {
            status = 'NOT_READY';
        }

        return {
            ...recipe,
            status,
            missingIngredients,
            missingCount,
        };
    });
}

export function getSmartSuggestions(recipesWithStatus: RecipeWithStatus[]) {
    return [...recipesWithStatus].sort((a, b) => {
        // First by status (READY > ALMOST > NOT_READY)
        const statusOrder = { READY: 0, ALMOST: 1, NOT_READY: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        // Then by missing count
        if (a.missingCount !== b.missingCount) {
            return a.missingCount - b.missingCount;
        }
        // Then by favorite
        if (a.favorite !== b.favorite) {
            return a.favorite ? -1 : 1;
        }
        // Then by cook count (more cooked = more preferred)
        return (b.cookCount || 0) - (a.cookCount || 0);
    });
}

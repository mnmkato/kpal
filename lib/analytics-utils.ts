import { Recipe, CookingHistory, RecipeWithStatus, Analytics } from '@/types';

export function calculateAnalytics(
    recipes: Recipe[],
    cookingHistory: CookingHistory[],
    recipesWithStatus: RecipeWithStatus[]
): Analytics {
    // Most cooked recipes
    const mostCookedRecipes = [...recipes]
        .filter(r => (r.cookCount || 0) > 0)
        .sort((a, b) => (b.cookCount || 0) - (a.cookCount || 0))
        .slice(0, 5)
        .map(r => ({ name: r.name, count: r.cookCount || 0 }));

    // Most missing items (from shopping lists)
    const missingCounts = new Map<string, number>();
    recipesWithStatus.forEach(r => {
        r.missingIngredients.forEach(ing => {
            missingCounts.set(ing, (missingCounts.get(ing) || 0) + 1);
        });
    });
    const mostMissingItems = Array.from(missingCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    return {
        mostCookedRecipes,
        mostMissingItems,
        totalMealsCooked: cookingHistory.length,
        favoriteCount: recipes.filter(r => r.favorite).length,
    };
}

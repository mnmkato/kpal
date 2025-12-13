import { MealPlan, RecipeWithStatus, DayOfWeek, MealType } from '@/types';

export function getMealWarnings(mealPlan: MealPlan, recipesWithStatus: RecipeWithStatus[]) {
    const warnings: Array<{ day: DayOfWeek; mealType: MealType; recipeName: string; missing: string[] }> = [];

    Object.entries(mealPlan).forEach(([day, meals]) => {
        Object.entries(meals).forEach(([mealType, recipeId]) => {
            if (recipeId) {
                const recipe = recipesWithStatus.find(r => r.id === recipeId);
                if (recipe && recipe.status === 'NOT_READY') {
                    warnings.push({
                        day: day as DayOfWeek,
                        mealType: mealType as MealType,
                        recipeName: recipe.name,
                        missing: recipe.missingIngredients,
                    });
                }
            }
        });
    });

    return warnings;
}

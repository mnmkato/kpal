import { MealPlanPageClient } from './MealPlanPageClient';
import { getMealPlan, getRecipes, getGroceries, setMeal, autoGenerateMealPlan, clearMealPlan, markAsCooked } from '../actions';
import { calculateRecipeStatus } from '@/lib/recipe-utils';

export default async function MealPlanPage() {
    const [mealPlan, recipes, groceries] = await Promise.all([
        getMealPlan(),
        getRecipes(),
        getGroceries()
    ]);

    const recipesWithStatus = calculateRecipeStatus(recipes as any, groceries as any);
    const validRecipes = recipesWithStatus.filter(r => r.status === 'READY' || r.status === 'ALMOST');
    const warnings: string[] = []; // Warnings feature not implemented

    return (
        <MealPlanPageClient
            mealPlan={mealPlan}
            recipesWithStatus={recipesWithStatus}
            validRecipes={validRecipes}
            warnings={warnings}
            setMeal={setMeal}
            autoGenerateMealPlan={autoGenerateMealPlan}
            clearMealPlan={clearMealPlan}
            markAsCooked={markAsCooked}
        />
    );
}

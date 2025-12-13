'use client'

import { MealPlanScreen } from '@/components/MealPlanScreen';
import { toast } from 'sonner';
import { DayOfWeek, MealType } from '@/types';

export function MealPlanPageClient({
    mealPlan,
    recipesWithStatus,
    validRecipes,
    warnings,
    setMeal,
    autoGenerateMealPlan,
    clearMealPlan,
    markAsCooked
}: any) {

    const handleAutoGenerate = async () => {
        const success = await autoGenerateMealPlan();
        if (success) {
            toast.success('Meal plan generated!', {
                description: 'Your week is now planned with available recipes',
            });
        } else {
            toast.error('Not enough recipes', {
                description: 'Add more groceries to unlock recipes first',
            });
        }
        return success;
    };

    const handleClearPlan = async () => {
        await clearMealPlan();
        toast.success('Meal plan cleared');
    };

    const handleSetMeal = async (day: DayOfWeek, mealType: MealType, recipeId: string | null) => {
        await setMeal(day, mealType, recipeId);
        if (recipeId) {
            const recipe = recipesWithStatus.find((r: any) => r.id === recipeId);
            toast.success(`Added ${recipe?.name} to ${day} ${mealType}`);
        }
    };

    const handleMarkAsCooked = async (recipeId: string) => {
        await markAsCooked(recipeId);
        const recipe = recipesWithStatus.find((r: any) => r.id === recipeId);
        toast.success(`Marked ${recipe?.name} as cooked!`);
    };

    return (<div className="pb-20 px-4 max-w-lg mx-auto pt-4">
        <MealPlanScreen
            mealPlan={mealPlan}
            recipes={recipesWithStatus}
            validRecipes={validRecipes}
            onSetMeal={handleSetMeal}
            onAutoGenerate={handleAutoGenerate}
            onClearPlan={handleClearPlan}
            onMarkAsCooked={handleMarkAsCooked}
            warnings={warnings}
        />
    </div>
    );
}

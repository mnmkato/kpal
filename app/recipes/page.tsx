import { getRecipes, getGroceries, getCookingHistory, addRecipe, toggleFavorite, markAsCooked, setMeal, deleteRecipe } from '@/app/actions';
import { RecipeScreen } from '@/components/RecipeScreen';
import { calculateRecipeStatus, getSmartSuggestions } from '@/lib/recipe-utils';
import { DayOfWeek, MealType } from '@/types';

export default async function RecipesPage() {
    const [recipes, groceries, cookingHistory] = await Promise.all([
        getRecipes(),
        getGroceries(),
        getCookingHistory()
    ]);

    const recipesWithStatus = calculateRecipeStatus(recipes as any, groceries as any);
    const smartSuggestions = getSmartSuggestions(recipesWithStatus);
    const favoriteRecipes = recipesWithStatus.filter(r => r.favorite);

    async function handleAddToMealPlan(recipeId: string, day: DayOfWeek, mealType: MealType) {
        'use server'
        await setMeal(day, mealType, recipeId);
    }

    async function handleAddRecipe(name: string, ingredients: string[]) {
        'use server'
        await addRecipe(name, ingredients);
    }

    async function handleToggleFavorite(id: string) {
        'use server'
        await toggleFavorite(id);
    }

    async function handleMarkAsCooked(id: string) {
        'use server'
        await markAsCooked(id);
    }

    async function handleDeleteRecipe(id: string) {
        'use server'
        await deleteRecipe(id);
    }

    return (
        <div className="pb-20 px-4 max-w-lg mx-auto pt-4">
            <RecipeScreen
                recipes={recipesWithStatus}
                smartSuggestions={smartSuggestions}
                favoriteRecipes={favoriteRecipes}
                recentlyCooked={cookingHistory as any}
                groceries={groceries as any}
                onAddToMealPlan={handleAddToMealPlan}
                onAddRecipe={handleAddRecipe}
                onToggleFavorite={handleToggleFavorite}
                onMarkAsCooked={handleMarkAsCooked}
                onDeleteRecipe={handleDeleteRecipe}
            />
        </div>
    )
}

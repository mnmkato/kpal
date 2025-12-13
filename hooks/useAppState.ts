import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, GroceryItem, Recipe, MealPlan, RecipeWithStatus, ShoppingItem, DayOfWeek, MealType, Category, CookingHistory, Analytics } from '@/types';
import { initialGroceries, initialRecipes, initialMealPlan, initialCookingHistory, daysOfWeek, mealTypes } from '@/data/initialData';

const STORAGE_KEY = 'kitchen-planner-state';

const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        cookingHistory: parsed.cookingHistory || [],
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {
    groceries: initialGroceries,
    recipes: initialRecipes,
    mealPlan: initialMealPlan,
    cookingHistory: initialCookingHistory,
  };
};

const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Toggle grocery availability
  const toggleGrocery = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      groceries: prev.groceries.map(g =>
        g.id === id ? { ...g, available: !g.available } : g
      ),
    }));
  }, []);

  // Add new grocery
  const addGrocery = useCallback((name: string, category: Category) => {
    const newGrocery: GroceryItem = {
      id: `g-${Date.now()}`,
      name,
      category,
      available: false,
    };
    setState(prev => ({
      ...prev,
      groceries: [...prev.groceries, newGrocery],
    }));
  }, []);

  // Calculate recipe status with smart sorting
  const recipesWithStatus = useMemo((): RecipeWithStatus[] => {
    const availableIngredients = new Set(
      state.groceries.filter(g => g.available).map(g => g.name)
    );

    return state.recipes.map(recipe => {
      const missingIngredients = recipe.ingredients.filter(
        ing => !availableIngredients.has(ing)
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
  }, [state.groceries, state.recipes]);

  // Smart recipe suggestions - sorted by least missing, then favorites, then cook count
  const smartRecipeSuggestions = useMemo(() => {
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
  }, [recipesWithStatus]);

  // Get recipe by ID with status
  const getRecipeWithStatus = useCallback((id: string): RecipeWithStatus | undefined => {
    return recipesWithStatus.find(r => r.id === id);
  }, [recipesWithStatus]);

  // Toggle recipe favorite
  const toggleFavorite = useCallback((recipeId: string) => {
    setState(prev => ({
      ...prev,
      recipes: prev.recipes.map(r =>
        r.id === recipeId ? { ...r, favorite: !r.favorite } : r
      ),
    }));
  }, []);

  // Set meal in plan
  const setMeal = useCallback((day: DayOfWeek, mealType: MealType, recipeId: string | null) => {
    setState(prev => ({
      ...prev,
      mealPlan: {
        ...prev.mealPlan,
        [day]: {
          ...prev.mealPlan[day],
          [mealType]: recipeId,
        },
      },
    }));
  }, []);

  // Clear meal from plan
  const clearMeal = useCallback((day: DayOfWeek, mealType: MealType) => {
    setMeal(day, mealType, null);
  }, [setMeal]);

  // Mark meal as cooked (add to history, increment cook count)
  const markAsCooked = useCallback((recipeId: string) => {
    const recipe = state.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    setState(prev => ({
      ...prev,
      recipes: prev.recipes.map(r =>
        r.id === recipeId 
          ? { ...r, lastCooked: new Date().toISOString(), cookCount: (r.cookCount || 0) + 1 }
          : r
      ),
      cookingHistory: [
        { recipeId, recipeName: recipe.name, date: new Date().toISOString() },
        ...prev.cookingHistory,
      ].slice(0, 50), // Keep last 50 entries
    }));
  }, [state.recipes]);

  // Auto generate meal plan
  const autoGenerateMealPlan = useCallback(() => {
    const validRecipes = recipesWithStatus.filter(r => r.status === 'READY' || r.status === 'ALMOST');
    if (validRecipes.length === 0) return false;

    // Shuffle and distribute recipes avoiding repeats
    const shuffled = [...validRecipes].sort(() => Math.random() - 0.5);
    // Prioritize favorites
    const favorites = shuffled.filter(r => r.favorite);
    const nonFavorites = shuffled.filter(r => !r.favorite);
    const ordered = [...favorites, ...nonFavorites];

    const newMealPlan: MealPlan = { ...initialMealPlan };
    let recipeIndex = 0;

    for (const day of daysOfWeek) {
      for (const meal of mealTypes) {
        if (ordered.length > 0) {
          newMealPlan[day][meal] = ordered[recipeIndex % ordered.length].id;
          recipeIndex++;
        }
      }
    }

    setState(prev => ({
      ...prev,
      mealPlan: newMealPlan,
    }));

    return true;
  }, [recipesWithStatus]);

  // Clear entire meal plan
  const clearMealPlan = useCallback(() => {
    setState(prev => ({
      ...prev,
      mealPlan: initialMealPlan,
    }));
  }, []);

  // Generate shopping list
  const shoppingList = useMemo((): ShoppingItem[] => {
    const neededIngredients = new Map<string, Set<string>>();
    const availableIngredients = new Set(
      state.groceries.filter(g => g.available).map(g => g.name)
    );

    Object.values(state.mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipeId => {
        if (recipeId) {
          const recipe = state.recipes.find(r => r.id === recipeId);
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
      const grocery = state.groceries.find(g => g.name === name);
      return {
        id: `shop-${name}`,
        name,
        neededFor: Array.from(recipes),
        purchased: false,
        category: grocery?.category || 'Other',
      };
    });
  }, [state.mealPlan, state.recipes, state.groceries]);

  // Purchase item
  const purchaseItem = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      groceries: prev.groceries.map(g =>
        g.name === name ? { ...g, available: true } : g
      ),
    }));
  }, []);

  // Add new recipe
  const addRecipe = useCallback((name: string, ingredients: string[]) => {
    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}`,
      name,
      ingredients,
      favorite: false,
      cookCount: 0,
    };
    setState(prev => ({
      ...prev,
      recipes: [...prev.recipes, newRecipe],
    }));
  }, []);

  // Get valid recipes for meal plan
  const validRecipesForMealPlan = useMemo(() => {
    return recipesWithStatus.filter(r => r.status === 'READY' || r.status === 'ALMOST');
  }, [recipesWithStatus]);

  // Favorite recipes
  const favoriteRecipes = useMemo(() => {
    return recipesWithStatus.filter(r => r.favorite);
  }, [recipesWithStatus]);

  // Recently cooked (last 10)
  const recentlyCooked = useMemo(() => {
    return state.cookingHistory.slice(0, 10);
  }, [state.cookingHistory]);

  // Get meal warnings
  const getMealWarnings = useCallback(() => {
    const warnings: Array<{ day: DayOfWeek; mealType: MealType; recipeName: string; missing: string[] }> = [];
    
    Object.entries(state.mealPlan).forEach(([day, meals]) => {
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
  }, [state.mealPlan, recipesWithStatus]);

  // Analytics
  const analytics = useMemo((): Analytics => {
    // Most cooked recipes
    const mostCookedRecipes = [...state.recipes]
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
      totalMealsCooked: state.cookingHistory.length,
      favoriteCount: state.recipes.filter(r => r.favorite).length,
    };
  }, [state.recipes, state.cookingHistory, recipesWithStatus]);

  return {
    groceries: state.groceries,
    recipes: state.recipes,
    recipesWithStatus,
    smartRecipeSuggestions,
    mealPlan: state.mealPlan,
    shoppingList,
    validRecipesForMealPlan,
    favoriteRecipes,
    recentlyCooked,
    analytics,
    toggleGrocery,
    addGrocery,
    setMeal,
    clearMeal,
    clearMealPlan,
    autoGenerateMealPlan,
    purchaseItem,
    addRecipe,
    toggleFavorite,
    markAsCooked,
    getRecipeWithStatus,
    getMealWarnings,
  };
};

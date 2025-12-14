export type Category = 'Vegetables' | 'Fruits' | 'Spices' | 'Food' | 'Other';

export interface GroceryItem {
  id: string;
  name: string;
  category: Category;
  available: boolean;
}

export interface RecipeIngredient {
  name: string;
}

export interface RecipeUpdateInput {
  name?: string;
  favorite?: boolean;
  cookCount?: number;
  lastCooked?: Date | null;
  ingredients?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  ingredientDetails?: RecipeIngredient[];
  favorite?: boolean;
  lastCooked?: string; // ISO date
  cookCount?: number;
}

export type RecipeStatus = 'READY' | 'ALMOST' | 'NOT_READY';

export interface RecipeWithStatus extends Recipe {
  status: RecipeStatus;
  missingIngredients: string[];
  missingCount: number;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface MealSlot {
  day: DayOfWeek;
  mealType: MealType;
  recipeId: string | null;
}

export type MealPlan = {
  [day in DayOfWeek]: {
    [meal in MealType]: string | null;
  };
};

export interface ShoppingItem {
  id: string;
  name: string;
  neededFor: string[];
  purchased: boolean;
  category: Category;
}

export interface CookingHistory {
  recipeId: string;
  recipeName: string;
  date: string; // ISO date
}

export interface Analytics {
  mostCookedRecipes: { name: string; count: number }[];
  mostMissingItems: { name: string; count: number }[];
  totalMealsCooked: number;
  favoriteCount: number;
}

export interface AppState {
  groceries: GroceryItem[];
  recipes: Recipe[];
  mealPlan: MealPlan;
  cookingHistory: CookingHistory[];
}

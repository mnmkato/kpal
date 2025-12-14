'use server'

import prisma from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { calculateRecipeStatus } from '@/lib/recipe-utils';
import { Category, GroceryItem, Recipe, RecipeUpdateInput } from '@/types';

// Groceries
export async function getGroceries() {
    return await prisma.groceryItem.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function addGrocery(name: string, category: string) {
    await prisma.groceryItem.create({
        data: {
            name,
            category,
            available: false,
        },
    });
    revalidatePath('/groceries');
}

export async function toggleGrocery(id: string) {
    const item = await prisma.groceryItem.findUnique({ where: { id } });
    if (item) {
        await prisma.groceryItem.update({
            where: { id },
            data: { available: !item.available },
        });
        revalidatePath('/groceries');
    }
}

export async function updateGrocery(id: string, name: string, category: string) {
    const item = await prisma.groceryItem.findUnique({ where: { id } });
    if (item) {
        await prisma.groceryItem.update({
            where: { id },
            data: { name, category },
        });
        revalidatePath('/groceries');
    }
}

export async function deleteGrocery(id: string) {
    await prisma.groceryItem.delete({ where: { id } });
    revalidatePath('/groceries');
}
export async function getRecipesWithStatus() {
    const recipesFromDb = await getRecipes();
    const groceriesFromDb = await getGroceries();

    // Normalize types 
    const recipes: Recipe[] = recipesFromDb.map(r => ({
        ...r,
        lastCooked: r.lastCooked?.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
    }));

    const groceries: GroceryItem[] = groceriesFromDb.map(g => ({
        ...g,
        category: g.category as Category,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
    }));

    return calculateRecipeStatus(recipes, groceries);
}
// Recipes
export async function getRecipes() {
    const recipes = await prisma.recipe.findMany();
    return recipes.map(r => ({
        ...r,
        ingredients: JSON.parse(r.ingredients) as string[],
    }));
}

export async function addRecipe(name: string, ingredients: string[]) {
    await prisma.recipe.create({
        data: {
            name,
            ingredients: JSON.stringify(ingredients),
        },
    });
    revalidatePath('/recipes');
}

export async function updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id'>>) {
    const prismaData: any = { ...updates };
    if (updates.ingredients) {
        prismaData.ingredients = JSON.stringify(updates.ingredients);
    }
    await prisma.recipe.update({
        where: { id },
        data: prismaData,
    });
    revalidatePath('/recipes');
}
export async function toggleFavorite(id: string) {
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (recipe) {
        await prisma.recipe.update({
            where: { id },
            data: { favorite: !recipe.favorite },
        });
        revalidatePath('/recipes');
    }
}

export async function markAsCooked(id: string) {
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (recipe) {
        await prisma.$transaction([
            prisma.recipe.update({
                where: { id },
                data: {
                    cookCount: { increment: 1 },
                    lastCooked: new Date(),
                },
            }),
            prisma.cookingHistory.create({
                data: {
                    recipeId: id,
                    recipeName: recipe.name,
                },
            }),
        ]);
        revalidatePath('/recipes');
        revalidatePath('/analytics');
    }
}

export async function deleteRecipe(id: string) {
    // First delete any meal plan entries that reference this recipe
    await prisma.mealPlan.deleteMany({ where: { recipeId: id } });
    // Delete cooking history entries
    await prisma.cookingHistory.deleteMany({ where: { recipeId: id } });
    // Then delete the recipe
    await prisma.recipe.delete({ where: { id } });
    revalidatePath('/recipes');
    revalidatePath('/meal-plan');
}

// Meal Plan
export async function getMealPlan() {
    const plan = await prisma.mealPlan.findMany();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    const formattedPlan: any = {};

    days.forEach(day => {
        formattedPlan[day] = {};
        meals.forEach(meal => {
            formattedPlan[day][meal] = null;
        });
    });

    plan.forEach(p => {
        if (formattedPlan[p.day]) {
            formattedPlan[p.day][p.mealType] = p.recipeId;
        }
    });

    return formattedPlan;
}

export async function setMeal(day: string, mealType: string, recipeId: string | null) {
    if (recipeId) {
        await prisma.mealPlan.upsert({
            where: {
                day_mealType: { day, mealType },
            },
            update: { recipeId },
            create: { day, mealType, recipeId },
        });
    } else {
        await prisma.mealPlan.deleteMany({
            where: { day, mealType },
        });
    }
    revalidatePath('/meal-plan');
}

export async function clearMealPlan() {
    await prisma.mealPlan.deleteMany();
    revalidatePath('/meal-plan');
}

// Shopping List
export async function purchaseItem(id: string, name: string, category: Category) {
    const item = await prisma.groceryItem.findFirst({ where: { id } });
    await prisma.groceryItem.upsert({
        where: { id },
        update: {
            available: true,
        },
        create: {
            id,
            name,
            category,
            available: true,
        },
    });

    revalidatePath('/shopping');
    revalidatePath('/groceries');
}

export async function getCookingHistory() {
    return await prisma.cookingHistory.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });
}

export async function autoGenerateMealPlan() {
    const recipes = await getRecipes();
    const groceries = await getGroceries();

    const recipesWithStatus = calculateRecipeStatus(recipes as any, groceries as any);
    const validRecipes = recipesWithStatus.filter(r => r.status === 'READY' || r.status === 'ALMOST');

    if (validRecipes.length === 0) return false;

    const shuffled = [...validRecipes].sort(() => Math.random() - 0.5);
    const favorites = shuffled.filter(r => r.favorite);
    const nonFavorites = shuffled.filter(r => !r.favorite);
    const ordered = [...favorites, ...nonFavorites];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    let recipeIndex = 0;

    await prisma.mealPlan.deleteMany();

    const newPlanEntries = [];

    for (const day of days) {
        for (const meal of meals) {
            if (ordered.length > 0) {
                const recipe = ordered[recipeIndex % ordered.length];
                newPlanEntries.push({
                    day,
                    mealType: meal,
                    recipeId: recipe.id
                });
                recipeIndex++;
            }
        }
    }

    if (newPlanEntries.length > 0) {
        await prisma.mealPlan.createMany({
            data: newPlanEntries
        });
    }

    revalidatePath('/meal-plan');
    return true;
}

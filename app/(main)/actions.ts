'use server'

import prisma from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { calculateRecipeStatus } from '@/lib/recipe-utils';
import { Category, GroceryItem, Recipe } from '@/types';
import { createClient } from '@/lib/supabase/server';

async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
}

// ----------------- Groceries -----------------
export async function getGroceries(includeDeleted = false) {
    const user = await getCurrentUser();
    if (!user) return [];
    return await prisma.groceryItem.findMany({
        where: { 
            userId: user.id, 
            ...(includeDeleted ? {} : { deletedAt: null }) 
        },
        orderBy: { createdAt: 'desc' },
    });
}

export async function addGrocery(name: string, category: string) {
    const user = await getCurrentUser();
    if (!user) return;

    await prisma.groceryItem.create({
        data: {
            name,
            category,
            available: false,
            userId: user.id,
        },
    });
    revalidatePath('/groceries');
}

export async function toggleGrocery(id: string) {
    const user = await getCurrentUser();
    if (!user) return;

    const item = await prisma.groceryItem.findFirst({ where: { id, userId: user.id } });
    if (!item) return;

    await prisma.groceryItem.update({
        where: { id },
        data: { available: !item.available },
    });
    revalidatePath('/groceries');
}

export async function updateGrocery(id: string, name: string, category: string) {
    const user = await getCurrentUser();
    if (!user) return;

    const item = await prisma.groceryItem.findFirst({ where: { id, userId: user.id } });
    if (!item) return;

    await prisma.groceryItem.update({
        where: { id },
        data: { name, category },
    });
    revalidatePath('/groceries');
}

export async function deleteGrocery(id: string) {
    const user = await getCurrentUser();
    if (!user) return;

    await prisma.groceryItem.update({ where: { id, userId: user.id }, data: { deletedAt: new Date() } });
    revalidatePath('/groceries');
}

// Recipes
export async function getRecipes() {
    const user = await getCurrentUser();
    if (!user) return [];

    const recipes = await prisma.recipe.findMany({
        where: { userId: user.id },
    });

    return recipes;
}

export async function addRecipe(name: string, ingredients: string[]) {
    const user = await getCurrentUser();
    if (!user) return;

    await prisma.recipe.create({
        data: {
            name,
            ingredients,
            userId: user.id,
        },
    });
    revalidatePath('/recipes');
}

export async function updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id'>>) {
    const user = await getCurrentUser();
    if (!user) return;

    const recipe = await prisma.recipe.findFirst({ where: { id, userId: user.id } });
    if (!recipe) return;

    const prismaData: any = { ...updates };
    if (updates.ingredients) prismaData.ingredients = updates.ingredients;

    await prisma.recipe.update({ where: { id }, data: prismaData });
    revalidatePath('/recipes');
}

export async function toggleFavorite(id: string) {
    const user = await getCurrentUser();
    if (!user) return;

    const recipe = await prisma.recipe.findFirst({ where: { id, userId: user.id } });
    if (!recipe) return;

    await prisma.recipe.update({
        where: { id },
        data: { favorite: !recipe.favorite },
    });
    revalidatePath('/recipes');
}

export async function markAsCooked(id: string) {
    const user = await getCurrentUser();
    if (!user) return;

    const recipe = await prisma.recipe.findFirst({ where: { id, userId: user.id } });
    if (!recipe) return;

    await prisma.$transaction([
        prisma.recipe.update({
            where: { id },
            data: { cookCount: { increment: 1 }, lastCooked: new Date() },
        }),
        prisma.cookingHistory.create({
            data: { recipeId: id, recipeName: recipe.name, userId: user.id },
        }),
    ]);
    revalidatePath('/recipes');
    revalidatePath('/analytics');
}

export async function deleteRecipe(id: string) {
    const user = await getCurrentUser();
    if (!user) return;

    await prisma.mealPlan.deleteMany({ where: { recipeId: id, userId: user.id } });
    await prisma.cookingHistory.deleteMany({ where: { recipeId: id, userId: user.id } });
    await prisma.recipe.deleteMany({ where: { id, userId: user.id } });

    revalidatePath('/recipes');
    revalidatePath('/meal-plan');
}

// Get recipes along with grocery items and calculate status per user
export async function getRecipesWithStatus() {
    const user = await getCurrentUser();
    if (!user) return { recipes: [], groceries: [], statusMap: {} };

    // Fetch user-scoped data
    const [recipesFromDb, groceriesFromDb] = await Promise.all([
        prisma.recipe.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.groceryItem.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    // Normalize recipes
    const recipes: Recipe[] = recipesFromDb.map(r => ({
        ...r,
        ingredients: Array.isArray(r.ingredients)
            ? r.ingredients.filter((i): i is string => typeof i === 'string')
            : [],
        lastCooked: r.lastCooked?.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
    }));

    // Normalize groceries
    const groceries: GroceryItem[] = groceriesFromDb.map(g => ({
        ...g,
        category: g.category as Category,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
    }));

    // Calculate status using your existing utility
    const statusMap = calculateRecipeStatus(recipes, groceries);

    return { recipes, groceries, statusMap };
}

// ----------------- Meal Plan -----------------
export async function getMealPlan() {
    const user = await getCurrentUser();
    if (!user) return {};

    const plan = await prisma.mealPlan.findMany({ where: { userId: user.id } });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    const formattedPlan: Record<string, Record<string, string | null>> = {};
    days.forEach(day => {
        formattedPlan[day] = {};
        meals.forEach(meal => formattedPlan[day][meal] = null);
    });

    plan.forEach(p => {
        if (formattedPlan[p.day]) formattedPlan[p.day][p.mealType] = p.recipeId;
    });

    return formattedPlan;
}

export async function setMeal(day: string, mealType: string, recipeId: string | null) {
    const user = await getCurrentUser();
    if (!user) return;

    if (recipeId) {
        await prisma.mealPlan.upsert({
            where: { day_mealType_user: { day, mealType, userId: user.id } },
            update: { recipeId },
            create: { day, mealType, recipeId, userId: user.id },
        });
    } else {
        await prisma.mealPlan.deleteMany({ where: { day, mealType, userId: user.id } });
    }
    revalidatePath('/meal-plan');
}

export async function clearMealPlan() {
    const user = await getCurrentUser();
    if (!user) return;
    await prisma.mealPlan.deleteMany({ where: { userId: user.id } });
    revalidatePath('/meal-plan');
}

// ----------------- Shopping List -----------------
export async function purchaseItem(id: string, name: string, category: Category) {
    const user = await getCurrentUser();
    if (!user) return;

    const item = await prisma.groceryItem.findFirst({ where: { id, userId: user.id } });
    if (item?.deletedAt !== null) {
        await prisma.groceryItem.create({
            data: {
                id,
                name,
                category,
                available: true,
                userId: user.id,
            },
        });
    } else {
        await prisma.groceryItem.update({
            where: { id },
            data: { available: true, deletedAt: null },
        });
    }

    revalidatePath('/shopping');
    revalidatePath('/groceries');
}

// ----------------- Cooking History -----------------
export async function getCookingHistory() {
    const user = await getCurrentUser();
    if (!user) return [];
    return await prisma.cookingHistory.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 50
    });
}

// ----------------- Auto Generate Meal Plan -----------------
export async function autoGenerateMealPlan() {
    const user = await getCurrentUser();
    if (!user) return false;

    const recipes = await getRecipes();
    const groceries = await getGroceries();

    const recipesWithStatus = calculateRecipeStatus(recipes as any, groceries as any);
    const validRecipes = recipesWithStatus.filter(r => r.status === 'READY' || r.status === 'ALMOST');
    if (!validRecipes.length) return false;

    const shuffled = [...validRecipes].sort(() => Math.random() - 0.5);
    const favorites = shuffled.filter(r => r.favorite);
    const nonFavorites = shuffled.filter(r => !r.favorite);
    const ordered = [...favorites, ...nonFavorites];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    let recipeIndex = 0;
    await prisma.mealPlan.deleteMany({ where: { userId: user.id } });

    const newPlanEntries = [];
    for (const day of days) {
        for (const meal of meals) {
            if (ordered.length > 0) {
                const recipe = ordered[recipeIndex % ordered.length];
                newPlanEntries.push({ day, mealType: meal, recipeId: recipe.id, userId: user.id });
                recipeIndex++;
            }
        }
    }

    if (newPlanEntries.length) {
        await prisma.mealPlan.createMany({ data: newPlanEntries });
    }

    revalidatePath('/meal-plan');
    return true;
}

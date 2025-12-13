import { GroceryItem, Recipe, MealPlan, Category, CookingHistory } from '@/types';

export const initialGroceries: GroceryItem[] = [
  // Vegetables
  { id: 'v1', name: 'Tomatoes', category: 'Vegetables', available: true},
  { id: 'v2', name: 'Onions', category: 'Vegetables', available: true},
  { id: 'v3', name: 'Garlic', category: 'Vegetables', available: true},
  { id: 'v4', name: 'Bell Peppers', category: 'Vegetables', available: false },
  { id: 'v5', name: 'Carrots', category: 'Vegetables', available: true},
  { id: 'v6', name: 'Spinach', category: 'Vegetables', available: false },
  { id: 'v7', name: 'Potatoes', category: 'Vegetables', available: true},
  { id: 'v8', name: 'Cucumber', category: 'Vegetables', available: false },
  
  // Fruits
  { id: 'f1', name: 'Bananas', category: 'Fruits', available: true},
  { id: 'f2', name: 'Apples', category: 'Fruits', available: true},
  { id: 'f3', name: 'Lemons', category: 'Fruits', available: false },
  { id: 'f4', name: 'Oranges', category: 'Fruits', available: false },
  { id: 'f5', name: 'Strawberries', category: 'Fruits', available: false },
  
  // Spices
  { id: 's1', name: 'Salt', category: 'Spices', available: true },
  { id: 's2', name: 'Black Pepper', category: 'Spices', available: true },
  { id: 's3', name: 'Cumin', category: 'Spices', available: true },
  { id: 's4', name: 'Paprika', category: 'Spices', available: false },
  { id: 's5', name: 'Oregano', category: 'Spices', available: true },
  { id: 's6', name: 'Cinnamon', category: 'Spices', available: true },
  
  // Food
  { id: 'fd1', name: 'Rice', category: 'Food', available: true },
  { id: 'fd2', name: 'Pasta', category: 'Food', available: true },
  { id: 'fd3', name: 'Bread', category: 'Food', available: true },
  { id: 'fd4', name: 'Eggs', category: 'Food', available: true },
  { id: 'fd5', name: 'Chicken', category: 'Food', available: false },
  { id: 'fd6', name: 'Cheese', category: 'Food', available: true },
  { id: 'fd7', name: 'Milk', category: 'Food', available: true },
  { id: 'fd8', name: 'Butter', category: 'Food', available: true },
  { id: 'fd9', name: 'Olive Oil', category: 'Food', available: true },
  
  // Other
  { id: 'o1', name: 'Honey', category: 'Other', available: true },
  { id: 'o2', name: 'Soy Sauce', category: 'Other', available: false },
  { id: 'o3', name: 'Vinegar', category: 'Other', available: true },
];

export const initialRecipes: Recipe[] = [
  {
    id: 'r1',
    name: 'Scrambled Eggs',
    ingredients: ['Eggs', 'Butter', 'Salt', 'Black Pepper', 'Milk'],
    favorite: true,
    cookCount: 5,
  },
  {
    id: 'r2',
    name: 'Tomato Pasta',
    ingredients: ['Pasta', 'Tomatoes', 'Garlic', 'Olive Oil', 'Salt', 'Oregano'],
    favorite: false,
    cookCount: 3,
  },
  {
    id: 'r3',
    name: 'Grilled Cheese Sandwich',
    ingredients: ['Bread', 'Cheese', 'Butter'],
    favorite: true,
    cookCount: 8,
  },
  {
    id: 'r4',
    name: 'Vegetable Stir Fry',
    ingredients: ['Bell Peppers', 'Carrots', 'Onions', 'Garlic', 'Soy Sauce', 'Olive Oil'],
    favorite: false,
    cookCount: 2,
  },
  {
    id: 'r5',
    name: 'Banana Pancakes',
    ingredients: ['Bananas', 'Eggs', 'Milk', 'Butter', 'Honey', 'Cinnamon'],
    favorite: true,
    cookCount: 4,
  },
  {
    id: 'r6',
    name: 'Garden Salad',
    ingredients: ['Cucumber', 'Tomatoes', 'Onions', 'Olive Oil', 'Vinegar', 'Salt'],
    favorite: false,
    cookCount: 1,
  },
  {
    id: 'r7',
    name: 'Fried Rice',
    ingredients: ['Rice', 'Eggs', 'Carrots', 'Onions', 'Soy Sauce', 'Garlic'],
    favorite: false,
    cookCount: 2,
  },
  {
    id: 'r8',
    name: 'Chicken Curry',
    ingredients: ['Chicken', 'Onions', 'Tomatoes', 'Garlic', 'Cumin', 'Paprika', 'Salt'],
    favorite: false,
    cookCount: 0,
  },
  {
    id: 'r9',
    name: 'Fresh Fruit Bowl',
    ingredients: ['Bananas', 'Apples', 'Oranges', 'Strawberries', 'Honey'],
    favorite: false,
    cookCount: 1,
  },
  {
    id: 'r10',
    name: 'Spinach Omelette',
    ingredients: ['Eggs', 'Spinach', 'Cheese', 'Salt', 'Black Pepper', 'Butter'],
    favorite: false,
    cookCount: 0,
  },
];

export const initialMealPlan: MealPlan = {
  Monday: { Breakfast: null, Lunch: null, Dinner: null },
  Tuesday: { Breakfast: null, Lunch: null, Dinner: null },
  Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
  Thursday: { Breakfast: null, Lunch: null, Dinner: null },
  Friday: { Breakfast: null, Lunch: null, Dinner: null },
  Saturday: { Breakfast: null, Lunch: null, Dinner: null },
  Sunday: { Breakfast: null, Lunch: null, Dinner: null },
};

export const initialCookingHistory: CookingHistory[] = [];

export const categories: Category[] = ['Vegetables', 'Fruits', 'Spices', 'Food', 'Other'];

export const daysOfWeek: Array<keyof MealPlan> = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const mealTypes: Array<'Breakfast' | 'Lunch' | 'Dinner'> = ['Breakfast', 'Lunch', 'Dinner'];
/*
import { PrismaClient, Prisma } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { initialGroceries, initialRecipes } from '../data/initialData';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.mealPlan.deleteMany();
    await prisma.cookingHistory.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.groceryItem.deleteMany();

    console.log('📦 Adding groceries...');
    for (const grocery of initialGroceries) {
        await prisma.groceryItem.create({
            data: {
                id: grocery.id,
                name: grocery.name,
                category: grocery.category,
                available: grocery.available,
            },
        });
    }
    console.log(`✅ Added ${initialGroceries.length} grocery items`);

    console.log('📖 Adding recipes...');
    for (const recipe of initialRecipes) {
        await prisma.recipe.create({
            data: {
                id: recipe.id,
                name: recipe.name,
                ingredients: JSON.stringify(recipe.ingredients),
                favorite: recipe.favorite,
                cookCount: recipe.cookCount || 0,
            },
        });
    }
    console.log(`✅ Added ${initialRecipes.length} recipes`);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
*/
import { getGroceries, addGrocery, toggleGrocery, getRecipesWithStatus, updateGrocery, deleteGrocery } from '@/app/actions';
import { GroceryScreen } from '@/components/GroceryScreen';
import { Category, GroceryItem } from '@/types';

export default async function GroceriesPage() {
    const groceries = await getGroceries();
    const recipesWithStatus = await getRecipesWithStatus();

    async function handleAdd(name: string, category: Category) {
        'use server'
        await addGrocery(name, category);
    }

    async function handleToggle(id: string) {
        'use server'
        await toggleGrocery(id);
    }
    async function handleUpdate(id: string, updates: Partial<Omit<GroceryItem, 'id'>>) {
        'use server'
        await updateGrocery(id, updates.name as string, updates.category as Category);
    }

    async function handleDelete(id: string) {
        'use server'
        await deleteGrocery(id);
    }

    return (
        <div className="pb-20 px-4 max-w-lg mx-auto pt-4">
            <GroceryScreen
                groceries={groceries as any}
                recipes={recipesWithStatus}
                onToggle={handleToggle}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />

        </div>
    )
}

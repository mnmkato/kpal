import { getGroceries, addGrocery, toggleGrocery } from '@/app/actions';
import { GroceryScreen } from '@/components/GroceryScreen';
import { Category } from '@/types';

export default async function GroceriesPage() {
    const groceries = await getGroceries();

    async function handleAdd(name: string, category: Category) {
        'use server'
        await addGrocery(name, category);
    }

    async function handleToggle(id: string) {
        'use server'
        await toggleGrocery(id);
    }

    return (
        <div className="pb-20 px-4 max-w-lg mx-auto pt-4">
            <GroceryScreen
                groceries={groceries as any}
                onAdd={handleAdd}
                onToggle={handleToggle}
            />
        </div>
    )
}

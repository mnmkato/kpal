import { getGroceries, addGrocery, toggleGrocery, updateGroceryQuantity } from '@/app/actions';
import { GroceryScreen } from '@/components/GroceryScreen';
import { Category, Unit } from '@/types';

export default async function GroceriesPage() {
    const groceries = await getGroceries();

    // Wrappers to match strict types if needed, or just pass directly if types align
    // Using wrappers to ensure 'use server' context is clear and types are compatible

    async function handleAdd(name: string, category: Category, quantity?: number, unit?: Unit) {
        'use server'
        await addGrocery(name, category, quantity, unit);
    }

    async function handleToggle(id: string) {
        'use server'
        await toggleGrocery(id);
    }

    async function handleUpdateQuantity(id: string, quantity: number, unit: Unit) {
        'use server'
        await updateGroceryQuantity(id, quantity, unit);
    }

    return (
        <div className="pb-20 px-4 max-w-lg mx-auto pt-4">
            <GroceryScreen
                groceries={groceries as any} // Casting because Prisma types might differ slightly from app types (e.g. Date vs string)
                onAdd={handleAdd}
                onToggle={handleToggle}
                onUpdateQuantity={handleUpdateQuantity}
            />
        </div>
    )
}

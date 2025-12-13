'use client'

import { usePathname, useRouter } from 'next/navigation';
import { BottomNav } from './BottomNav';

export function BottomNavWrapper({ shoppingCount }: { shoppingCount: number }) {
    const pathname = usePathname();
    const router = useRouter();

    let activeTab: any = 'groceries';
    if (pathname.includes('recipes')) activeTab = 'recipes';
    if (pathname.includes('meal-plan')) activeTab = 'mealplan';
    if (pathname.includes('shopping')) activeTab = 'shopping';
    if (pathname.includes('analytics')) activeTab = 'analytics';

    const handleTabChange = (tab: string) => {
        if (tab === 'groceries') router.push('/groceries');
        else if (tab === 'recipes') router.push('/recipes');
        else if (tab === 'mealplan') router.push('/meal-plan');
        else if (tab === 'shopping') router.push('/shopping');
        else if (tab === 'analytics') router.push('/analytics');
    };

    return (
        <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            shoppingCount={shoppingCount}
        />
    );
}

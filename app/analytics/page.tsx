import { getRecipes, getGroceries, getCookingHistory } from '@/app/actions';
import { AnalyticsScreen } from '@/components/AnalyticsScreen';
import { calculateRecipeStatus } from '@/lib/recipe-utils';
import { calculateAnalytics } from '@/lib/analytics-utils';

export default async function AnalyticsPage() {
    const [recipes, groceries, cookingHistory] = await Promise.all([
        getRecipes(),
        getGroceries(),
        getCookingHistory()
    ]);

    const recipesWithStatus = calculateRecipeStatus(recipes as any, groceries as any);
    const analytics = calculateAnalytics(recipes as any, cookingHistory as any, recipesWithStatus);

    return (
        <div className="pb-20 px-4 max-w-lg mx-auto pt-4">
            <AnalyticsScreen
                analytics={analytics}
            />
        </div>
    )
}

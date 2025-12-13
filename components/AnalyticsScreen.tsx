'use client';

import { TrendingUp, ShoppingCart, Heart, ChefHat, BarChart3 } from 'lucide-react';
import { Analytics } from '@/types';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AnalyticsScreenProps {
  analytics: Analytics;
}

export const AnalyticsScreen = ({ analytics }: AnalyticsScreenProps) => {
  const maxCookCount = Math.max(...analytics.mostCookedRecipes.map(r => r.count), 1);
  const maxMissingCount = Math.max(...analytics.mostMissingItems.map(i => i.count), 1);

  return (
    <div className="pb-4 animate-fade-in">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Your kitchen insights
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-lg border border-border p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-success" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalMealsCooked}</p>
          <p className="text-xs text-muted-foreground">Meals Cooked</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.favoriteCount}</p>
          <p className="text-xs text-muted-foreground">Favorite Recipes</p>
        </div>
      </div>

      {/* Most Cooked Recipes */}
      <div className="bg-card rounded-lg border border-border p-4 mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Most Cooked Recipes</h3>
        </div>

        {analytics.mostCookedRecipes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No cooking history yet</p>
            <p className="text-xs">Start cooking to see your stats!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.mostCookedRecipes.map((recipe, index) => (
              <div key={recipe.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{recipe.name}</span>
                  <span className="text-muted-foreground">{recipe.count}x</span>
                </div>
                <Progress
                  value={(recipe.count / maxCookCount) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Most Missing Items */}
      <div className="bg-card rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">Often Missing Items</h3>
        </div>

        {analytics.mostMissingItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No missing items</p>
            <p className="text-xs">Your pantry is well stocked!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.mostMissingItems.map((item, index) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">
                    blocks {item.count} recipe{item.count > 1 ? 's' : ''}
                  </span>
                </div>
                <Progress
                  value={(item.count / maxMissingCount) * 100}
                  className="h-2 [&>div]:bg-warning"
                />
              </div>
            ))}
          </div>
        )}

        {analytics.mostMissingItems.length > 0 && (
          <p className="text-xs text-muted-foreground mt-4 p-2 bg-secondary/30 rounded">
            💡 Tip: Stock up on these items to unlock more recipes!
          </p>
        )}
      </div>
    </div>
  );
};

'use client';

import { useState } from 'react';
import { Check, AlertTriangle, XCircle, ChevronRight, Plus, X, Heart, Sparkles, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { RecipeWithStatus, DayOfWeek, MealType, GroceryItem, CookingHistory, Recipe } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { daysOfWeek, mealTypes } from '@/data/initialData';

interface RecipeScreenProps {
  recipes: RecipeWithStatus[];
  smartSuggestions: RecipeWithStatus[];
  favoriteRecipes: RecipeWithStatus[];
  recentlyCooked: CookingHistory[];
  groceries: GroceryItem[];
  onAddToMealPlan: (recipeId: string, day: DayOfWeek, mealType: MealType) => void;
  onAddRecipe: (name: string, ingredients: string[]) => void;
  onToggleFavorite: (recipeId: string) => void;
  onMarkAsCooked: (recipeId: string) => void;
  onUpdateRecipe: (id: string, updates: Partial<Omit<Recipe, 'id'>>) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

const statusConfig = {
  READY: {
    icon: Check,
    label: 'Ready',
    className: 'bg-success/10 text-success border-success/20',
    iconClass: 'text-success',
  },
  ALMOST: {
    icon: AlertTriangle,
    label: 'Almost',
    className: 'bg-warning/10 text-warning border-warning/20',
    iconClass: 'text-warning',
  },
  NOT_READY: {
    icon: XCircle,
    label: 'Not Ready',
    className: 'bg-status-not-ready/10 text-status-not-ready border-status-not-ready/20',
    iconClass: 'text-status-not-ready',
  },
};

export const RecipeScreen = ({
  recipes,
  smartSuggestions,
  favoriteRecipes,
  recentlyCooked,
  groceries,
  onAddToMealPlan,
  onAddRecipe,
  onToggleFavorite,
  onMarkAsCooked,
  onUpdateRecipe,
  onDeleteRecipe,
}: RecipeScreenProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithStatus | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Dinner');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('suggestions');
  // Edit state
  const [editRecipe, setEditRecipe] = useState<RecipeWithStatus | null>(null);
  const [editName, setEditName] = useState('');
  const [editIngredients, setEditIngredients] = useState<string[]>([]);

  // Delete state
  const [deleteRecipe, setDeleteRecipe] = useState<RecipeWithStatus | null>(null);
  
  const groceryNameMap = new Map(groceries.map(g => [g.id, g.name]));

  const handleAddToMealPlan = () => {
    if (selectedRecipe) {
      onAddToMealPlan(selectedRecipe.id, selectedDay, selectedMeal);
      setSelectedRecipe(null);
    }
  };

  const handleAddRecipe = () => {
    if (newName.trim() && selectedIngredients.length > 0) {
      onAddRecipe(newName.trim(), selectedIngredients);
      setNewName('');
      setSelectedIngredients([]);
      setIsAdding(false);
    }
  };

  const toggleIngredient = (id: string) => {
    setSelectedIngredients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openEditDialog = (recipe: RecipeWithStatus) => {
    setEditRecipe(recipe);
    setEditName(recipe.name);
    setEditIngredients([...recipe.ingredients]);
  };

  const handleEditSave = () => {
    if (editRecipe && editName.trim() && editIngredients.length > 0) {
      onUpdateRecipe(editRecipe.id, {
        name: editName.trim(),
        ingredients: editIngredients,
      });
      setEditRecipe(null);
    }
  };

  const toggleEditIngredient = (name: string) => {
    setEditIngredients(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handleDelete = () => {
    if (deleteRecipe) {
      onDeleteRecipe(deleteRecipe.id);
      setDeleteRecipe(null);
    }
  };

  const readyCount = recipes.filter(r => r.status === 'READY').length;
  const almostCount = recipes.filter(r => r.status === 'ALMOST').length;

  const RecipeCard = ({ recipe, showSuggestion = false }: { recipe: RecipeWithStatus; showSuggestion?: boolean }) => {
    const config = statusConfig[recipe.status];
    const StatusIcon = config.icon;
    const canAddToMealPlan = recipe.status === 'READY' || recipe.status === 'ALMOST';

    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">{recipe.name}</h3>
              <button
                onClick={() => onToggleFavorite(recipe.id)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <Heart
                  className={cn(
                    'w-4 h-4 transition-colors',
                    recipe.favorite ? 'fill-accent text-accent' : 'text-muted-foreground'
                  )}
                />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className={cn('flex items-center gap-1', config.className)}>
                <StatusIcon className={cn('w-3 h-3', config.iconClass)} />
                {config.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => openEditDialog(recipe)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteRecipe(recipe)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showSuggestion && recipe.status === 'ALMOST' && (
            <div className="mb-2 p-2 bg-warning/10 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning">
                Buy {recipe.missingCount} item{recipe.missingCount > 1 ? 's' : ''} to unlock!
              </span>
            </div>
          )}

          {recipe.cookCount != null && (
            <p className="text-xs text-muted-foreground mb-2">
              Cooked {recipe.cookCount} time{recipe.cookCount !== 1 ? 's' : ''}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.ingredients.map(ingId => {
              const isMissing = recipe.missingIngredients.includes(ingId);
              const ingName = groceryNameMap.get(ingId) ?? 'Unknown';
              return (
                <Badge
                  key={ingId}
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    isMissing && 'bg-status-not-ready/10 text-status-not-ready border-status-not-ready/20'
                  )}
                >
                  {isMissing && '⚠️ '}{ingName}
                </Badge>
              );
            })}
          </div>

          <div className="flex gap-2">
            {canAddToMealPlan && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    Add to Plan <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>Add "{recipe.name}" to Meal Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Day</label>
                      <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as DayOfWeek)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {daysOfWeek.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Meal</label>
                      <Select value={selectedMeal} onValueChange={(v) => setSelectedMeal(v as MealType)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {mealTypes.map(meal => (
                            <SelectItem key={meal} value={meal}>{meal}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddToMealPlan} className="w-full">
                      <Check className="w-4 h-4 mr-1" /> Confirm
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-4 animate-fade-in">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
            <p className="text-sm text-muted-foreground">
              {readyCount} ready • {almostCount} almost ready
            </p>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="icon"
            variant={isAdding ? 'secondary' : 'default'}
            className="rounded-full shadow-lg"
          >
            {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </Button>
        </div>

        {isAdding && (
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border animate-slide-up">
            <div className="space-y-3">
              <Input
                placeholder="Recipe name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="bg-background"
                autoFocus
              />
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  Select ingredients ({selectedIngredients.length} selected)
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {groceries.map(g => (
                    <Badge
                      key={g.id}
                      variant={selectedIngredients.includes(g.id) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedIngredients.includes(g.name)
                          ? 'bg-emerald-500 text-primary-foreground'
                          : 'hover:bg-emerald-500'
                      )}
                      onClick={() => toggleIngredient(g.id)}
                    >
                      {g.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleAddRecipe}
                disabled={!newName.trim() || selectedIngredients.length === 0}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-1" /> Create Recipe
              </Button>
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="suggestions" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" /> Suggestions
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs">
            <Heart className="w-3 h-3 mr-1" /> Favorites
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">
            <Clock className="w-3 h-3 mr-1" /> Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-3">
          {smartSuggestions.map((recipe, index) => (
            <div key={recipe.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
              <RecipeCard recipe={recipe} showSuggestion />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-3">
          {favoriteRecipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No favorite recipes yet</p>
              <p className="text-sm">Tap the heart icon to add favorites</p>
            </div>
          ) : (
            favoriteRecipes.map((recipe, index) => (
              <div key={recipe.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                <RecipeCard recipe={recipe} />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-3">
          {recentlyCooked.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No cooking history yet</p>
              <p className="text-sm">Mark recipes as cooked to track history</p>
            </div>
          ) : (
            recentlyCooked.map((entry, index) => {
              const recipe = recipes.find(r => r.id === entry.recipeId);
              if (!recipe) return null;
              return (
                <div key={`${entry.recipeId}-${index}`} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                  <RecipeCard recipe={recipe} />
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
      {/* Edit Recipe Dialog */}
      <Dialog open={!!editRecipe} onOpenChange={(open) => !open && setEditRecipe(null)}>
        <DialogContent className="bg-card max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Recipe Name</label>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Ingredients ({editIngredients.length} selected)
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-border rounded-lg">
                {groceries.map(g => (
                  <Badge
                    key={g.id}
                    variant={editIngredients.includes(g.name) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-all',
                      editIngredients.includes(g.name)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    )}
                    onClick={() => toggleEditIngredient(g.name)}
                  >
                    {g.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditRecipe(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={!editName.trim() || editIngredients.length === 0}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRecipe} onOpenChange={(open) => !open && setDeleteRecipe(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteRecipe?.name}"? This will also remove it from your meal plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useCreateProductIngredient,
  useDeleteProductIngredient,
  useGetProductIngredients,
  useUpdateProductIngredient,
} from "../hooks/use-ingredients";
import { CreateProductIngredient } from "../types/product.dto";

export const IngredientsProduct = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState({
    name: "",
  });
  const [newIngredient, setNewIngredient] = useState({
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    data: ingredients = [],
    isLoading,
    error,
  } = useGetProductIngredients();
  const { mutate: createIngredient } = useCreateProductIngredient();
  const { mutate: deleteIngredient } = useDeleteProductIngredient();
  const { mutate: updateIngredient } = useUpdateProductIngredient();
  // Отладочная информация
  console.log("Hook result:", { ingredients, isLoading, error });

  const filteredSubGroups = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateIngredient = () => {
    if (newIngredient.name.trim()) {
      const newIngredientData: CreateProductIngredient = {
        name: newIngredient.name,
      };
      createIngredient(newIngredientData);
      setNewIngredient({ name: "" });
      // setIsCreating(false);
    }
  };

  const handleDeleteIngredient = (id: number) => {
    deleteIngredient(id);
    setIsDeleting(false);
  };

  const handleUpdateIngredient = (
    id: number,
    ingredient: CreateProductIngredient
  ) => {
    updateIngredient({ id, ingredient });
    setIsUpdating(false);
    setEditingIngredient({ name: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ингредиенты продуктов</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать ингредиент
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Поиск ингредиента..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Создание новой подгруппы */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Создать новую ингредиент</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="subgroup-name">Название ингредиента</Label>
              <Input
                id="subgroup-name"
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, name: e.target.value })
                }
                placeholder="Введите название ингредиента"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateIngredient}>
                Создать ингредиент
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewIngredient({ name: "" });
                }}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список подгрупп */}
      <div className="grid gap-4">
        {error ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-500">Ошибка загрузки: {error.message}</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Загрузка ингредиентов...</p>
            </CardContent>
          </Card>
        ) : filteredSubGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm
                  ? "Ингредиенты не найдены"
                  : "Ингредиенты не созданы"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubGroups.map((ingredient) => (
            <Card key={ingredient.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{ingredient.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isUpdating} onOpenChange={setIsUpdating}>
                      <DialogTrigger>
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="flex flex-col gap-12">
                        <DialogHeader>
                          <DialogTitle>
                            Обновить ингредиент &quot;{ingredient.name}&quot; ?
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-2">
                          <Label>Новое название ингредиента</Label>
                          <Input
                            value={editingIngredient.name}
                            onChange={(e) =>
                              setEditingIngredient({
                                ...editingIngredient,
                                name: e.target.value,
                              })
                            }
                            placeholder="Введите новое название ингредиента"
                          />
                        </div>
                        <DialogFooter className="flex justify-start!">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateIngredient(ingredient.id, ingredient)
                            }
                          >
                            Обновить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsUpdating(false)}
                          >
                            Отмена
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                      <DialogTrigger>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="flex flex-col gap-12">
                        <DialogHeader>
                          <DialogTitle>
                            Удалить ингредиент &quot;{ingredient.name}&quot; ?
                          </DialogTitle>
                        </DialogHeader>
                        <DialogFooter className="flex justify-start!">
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteIngredient(ingredient.id)
                            }
                          >
                            Удалить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleting(false)}
                          >
                            Отмена
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

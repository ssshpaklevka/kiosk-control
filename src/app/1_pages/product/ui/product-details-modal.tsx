"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Camera } from "lucide-react";
import { useGetProductById } from "../hooks/use-product";

interface ProductDetailsModalProps {
  productId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal = ({
  productId,
  isOpen,
  onClose,
}: ProductDetailsModalProps) => {
  const { data: product, isLoading, error } = useGetProductById(productId || 0);

  if (!isOpen || !productId) {
    return null;
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Загрузка продукта...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Загрузка...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !product) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ошибка загрузки</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">
              Не удалось загрузить информацию о продукте
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Изображение продукта */}
          <div className="space-y-4">
            <div className="flex justify-center items-center">
              {product.image ? (
                <Card
                  style={{
                    backgroundImage: `url(${product.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="size-[250px]"
                ></Card>
              ) : (
                <Card className="size-[250px] flex justify-center items-center border-2 border-dashed border-muted-foreground/25">
                  <Camera className="w-16 h-16 text-muted-foreground " />
                </Card>
              )}
            </div>
          </div>

          {/* Информация о продукте */}
          <div className="space-y-4">
            {/* Основная информация */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Основная информация</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Описание:
                    </span>
                    <p className="text-sm">{product.information.description}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Состав:
                    </span>
                    <p className="text-sm">{product.information.composition}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Цвет:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: product.color }}
                      />
                      <span className="text-sm">{product.color}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Пищевая ценность */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">
                  Пищевая ценность (на 100г)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {product.information.calories}
                    </div>
                    <div className="text-sm text-muted-foreground">Калории</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {product.information.proteins}г
                    </div>
                    <div className="text-sm text-muted-foreground">Белки</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {product.information.fats}г
                    </div>
                    <div className="text-sm text-muted-foreground">Жиры</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {product.information.carbohydrates}г
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Углеводы
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Группы и категории */}
        <div className="space-y-4">
          <Separator />

          {/* Группы */}
          {product.groups && product.groups.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Группы</h3>
                <div className="flex flex-wrap gap-2">
                  {product.groups.map((group) => (
                    <Badge
                      key={group.id}
                      variant="outline"
                      className="text-md font-normal"
                    >
                      {group.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Подгруппа</h3>
              <div className="flex flex-wrap gap-2">
                {product.subgroup.map((subgroup) => (
                  <Badge
                    key={subgroup}
                    variant="outline"
                    className="text-md font-normal"
                  >
                    {subgroup}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Дополнения */}
          {product.extras && product.extras.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Дополнения</h3>
                <div className="space-y-2">
                  {product.extras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-md font-medium">Название</span>
                        <span className="text-sm">{extra.name}</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-md font-medium">Цена</span>
                        <span className="text-sm">{extra.price}₽</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Типы */}
          {product.type && product.type.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Типы</h3>
                <div className="space-y-2">
                  {product.type.map((type) => (
                    <div
                      key={type.id}
                      className="grid grid-cols-3 border-b border-muted-foreground/25 pb-2"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-md font-medium">Название</span>
                        <span className="text-sm">{type.name}</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-md font-medium">Вес</span>
                        <span className="text-sm">{type.weight}</span>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <span className="text-md font-medium">Цена</span>
                        <span className="text-sm">{type.price}₽</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ингредиенты */}
          {product.ingredients && product.ingredients.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Ингредиенты</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-md font-normal"
                    >
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

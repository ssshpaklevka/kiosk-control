"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteProduct, useGetProduct } from "../hooks/use-product";
import { ProductDetailsModal } from "./product-details-modal";

export const TableProducts = () => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data: products, isLoading, error } = useGetProduct();
  const deleteProductMutation = useDeleteProduct();

  const handleDeleteProduct = (id: number) => {
    deleteProductMutation.mutate(id);
  };

  const handleViewProduct = (id: number) => {
    setSelectedProductId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка продуктов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Ошибка загрузки продуктов</div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Продукты не найдены</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Список продуктов</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Изображение</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Калории</TableHead>
                  <TableHead>Белки</TableHead>
                  <TableHead>Жиры</TableHead>
                  <TableHead>Углеводы</TableHead>
                  <TableHead>Подробнее</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell className="w-16">
                      <div className="cursor-pointer">
                        <div className="">
                          <Card
                            style={{
                              backgroundImage: `url(${product.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                            className="size-30"
                          ></Card>
                        </div>
                      </div>
                    </TableCell>

                    {/* Название продукта */}
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>

                    {/* Калории */}
                    <TableCell>{product.information.calories}</TableCell>

                    {/* Белки */}
                    <TableCell>{product.information.proteins}г</TableCell>

                    {/* Жиры */}
                    <TableCell>{product.information.fats}г</TableCell>

                    {/* Углеводы */}
                    <TableCell>{product.information.carbohydrates}г</TableCell>

                    {/* Подробнее */}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>

                    {/* Действия */}
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={deleteProductMutation.isPending}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Вы уверены, что хотите удалить этот продукт?
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ProductDetailsModal
        productId={selectedProductId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

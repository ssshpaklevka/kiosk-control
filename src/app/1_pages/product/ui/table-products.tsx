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
import { CameraOff, Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "../../../../components/ui/input";
import { useDeleteProduct, useGetProduct } from "../hooks/use-product";
import { ProductDetailsModal } from "./product-details-modal";
import { UpdateProduct } from "./update-product";

export const TableProducts = () => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [deleProductId, setDeleProductId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(
    null
  );
  const [isUpdatingProduct, setIsUpdatingProduct] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products, isLoading, error } = useGetProduct();
  const deleteProductMutation = useDeleteProduct();

  const handleDeleteProduct = (id: number) => {
    deleteProductMutation.mutate(id);
    setDeleProductId(id);
  };

  const handleViewProduct = (id: number) => {
    setSelectedProductId(id);
    setIsModalOpen(true);
  };

  const handleUpdateProduct = (id: number) => {
    setUpdatingProductId(id);
    setIsUpdatingProduct(true);
  };

  const handleCloseModalInfo = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  const handleCloseModalUpdate = () => {
    setIsUpdatingProduct(false);
    setUpdatingProductId(null);
  };

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск продукта..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
                  <TableHead>Удалить</TableHead>
                  <TableHead>Обновить</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => (
                  <TableRow
                    key={`${product.id}-${product.image}`}
                    className="group"
                  >
                    <TableCell className="w-16">
                      <div className="cursor-pointer">
                        <div className="">
                          {product.image ? (
                            <Card
                              style={{
                                backgroundImage: `url(${product.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                              className="size-30"
                            ></Card>
                          ) : (
                            <Card className="size-30 flex justify-center items-center border-2 border-dashed border-muted-foreground/25">
                              <CameraOff className="w-14 h-14 text-muted-foreground " />
                            </Card>
                          )}
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
                            disabled={
                              deleteProductMutation.isPending ||
                              deleProductId === product.id
                            }
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Вы уверены, что хотите удалить этот продукт{" "}
                              {product.name}?
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
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateProduct(product.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
        onClose={handleCloseModalInfo}
      />
      <UpdateProduct
        productId={updatingProductId || 0}
        isOpen={isUpdatingProduct}
        onClose={handleCloseModalUpdate}
      />
    </div>
  );
};

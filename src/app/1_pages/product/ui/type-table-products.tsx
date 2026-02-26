import { CameraOff, Pencil, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../components/ui/alert-dialog";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { TYPE_PRODUCT_ENUM } from "../enum/product-type.enum";
import { useDeleteTypes, useGetTypes, useUpdateTypes } from "../hooks/use-type";
import { ProductType, UpdateProductType } from "../types/type.dto";

interface EditingType {
  id: number;
  name: string;
  image?: File;
  description: string;
  type: TYPE_PRODUCT_ENUM;
  weight: string;
  currentImage: string;
}

interface FileValidationError {
  type: "format" | "dimensions" | "size";
  message: string;
}

export const TypeTableProducts = () => {
  const { data: types } = useGetTypes();
  const deleteTypesMutation = useDeleteTypes();
  const updateTypesMutation = useUpdateTypes();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingType, setEditingType] = useState<EditingType | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);

  const filteredTypes = types?.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTypes = (id: number) => {
    deleteTypesMutation.mutate(id);
  };

  const validateFile = async (
    file: File
  ): Promise<FileValidationError | null> => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        type: "format",
        message: "Поддерживаются только файлы формата JPEG, PNG и WebP",
      };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        type: "size",
        message: `Размер файла слишком большой: ${(file.size / 1024 / 1024).toFixed(2)} MB. Максимум: 10 MB`,
      };
    }

    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 1000 || img.height < 1000) {
          resolve({
            type: "dimensions",
            message: `Изображение слишком маленькое: ${img.width}x${img.height}px. Требуется: 1000x1000px`,
          });
          return;
        }

        resolve(null);
      };
      img.onerror = () => {
        resolve({
          type: "format",
          message: "Ошибка загрузки изображения",
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);
    setIsValidFile(false);
    setPreviewUrl(null);

    if (!file || !editingType) {
      return;
    }

    const error = await validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsValidFile(true);
    setPreviewUrl(URL.createObjectURL(file));
    setEditingType({ ...editingType, image: file });
  };

  const startEditing = (type: ProductType) => {
    setEditingType({
      id: type.id,
      name: type.name,
      description: type.description || "",
      type: type.type || TYPE_PRODUCT_ENUM.TYPE,
      weight: type.weight?.toString() || "",
      currentImage: type.image || "",
    });
    setPreviewUrl(null);
    setValidationError(null);
    setIsValidFile(false);
  };

  const handleUpdateTypes = () => {
    if (!editingType) return;

    const updateData: UpdateProductType = {
      name: editingType.name,
      description: editingType.description,
      type: editingType.type,
      weight: parseFloat(editingType.weight),
    };

    // Добавляем изображение только если выбрано новое
    if (editingType.image) {
      updateData.image = editingType.image;
    }

    updateTypesMutation.mutate(
      { id: editingType.id, type: updateData },
      {
        onSuccess: () => {
          setPreviewUrl(null);
          setValidationError(null);
          setIsValidFile(false);
        },
      }
    );

  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Типы продуктов</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск типа продукта..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Изображение</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Обновить</TableHead>
                <TableHead>Удалить</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTypes?.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>
                    {type.image ? (
                      <Image
                        src={type.image}
                        alt={type.name}
                        width={100}
                        height={100}
                      />
                    ) : (
                      <Card className="size-30 flex justify-center items-center border border-dashed border-muted-foreground/25">
                        <CameraOff className="w-14 h-14 text-muted-foreground " />
                      </Card>
                    )}
                  </TableCell>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEditing(type)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                          <DialogTitle>
                            Обновить тип продукта{" "}
                            {editingType?.name || type.name}
                          </DialogTitle>
                        </DialogHeader>
                        {editingType && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 items-center">
                              <Label>Изображение</Label>
                              <Card
                                style={{
                                  backgroundImage: `url(${previewUrl || editingType.currentImage})`,
                                }}
                                className="size-40 bg-cover bg-center bg-no-repeat relative"
                              >
                                {previewUrl && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                                    Новое
                                  </div>
                                )}
                              </Card>
                              <Input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileChange}
                              />
                              <p className="text-xs text-muted-foreground">
                                Требуется: 1000x1000px, до 10MB
                              </p>
                              {validationError && (
                                <p className="text-xs text-red-500">
                                  {validationError.message}
                                </p>
                              )}
                              {isValidFile && (
                                <p className="text-xs text-green-500">
                                  Изображение готово
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label>Название (из сета)</Label>
                              <Input
                                value={editingType.name}
                                onChange={(e) =>
                                  setEditingType({
                                    ...editingType,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Введите название"
                              />
                            </div>

                            <div className="flex flex-col gap-2">
                              <Label>Описание</Label>
                              <Input
                                value={editingType.description}
                                onChange={(e) =>
                                  setEditingType({
                                    ...editingType,
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Введите описание"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label>Тип номенклатуры</Label>
                              <Select
                                value={editingType.type}
                                onValueChange={(value) =>
                                  setEditingType({
                                    ...editingType,
                                    type: value as TYPE_PRODUCT_ENUM,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue
                                    placeholder={
                                      editingType.type
                                        ? editingType.type
                                        : "Выберите тип"
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={TYPE_PRODUCT_ENUM.TYPE}>
                                    Тип
                                  </SelectItem>
                                  <SelectItem value={TYPE_PRODUCT_ENUM.EXTRAS}>
                                    Добавка
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label>Вес</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingType.weight}
                                onChange={(e) =>
                                  setEditingType({
                                    ...editingType,
                                    weight: e.target.value,
                                  })
                                }
                                placeholder="Введите вес"
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUpdateTypes}
                            disabled={
                              !editingType ||
                              !editingType.name.trim() ||
                              !editingType.description.trim() ||
                              !editingType.weight ||
                              isNaN(parseFloat(editingType.weight)) ||
                              parseFloat(editingType.weight) <= 0 ||
                              (editingType.image && !isValidFile) ||
                              updateTypesMutation.isPending
                            }
                          >
                            {updateTypesMutation.isPending
                              ? "Обновление..."
                              : "Обновить"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Удалить тип продукта {type.name}?
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteTypes(type.id)}
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
        </CardContent>
      </Card>
    </>
  );
};

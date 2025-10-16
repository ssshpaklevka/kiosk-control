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
import {
  useDeleteExtras,
  useGetExtras,
  useUpdateExtras,
} from "../hooks/use-extras";
import { ProductExtras, UpdateProductExtras } from "../types/extras.dto";

interface EditingExtra {
  id: number;
  name: string;
  image?: File;
  description: string;
  price: string;
  type: TYPE_PRODUCT_ENUM;
  weight: string;
  currentImage: string;
}

interface FileValidationError {
  type: "format" | "dimensions" | "size";
  message: string;
}

export const ExtrasTableProducts = () => {
  const { data: extras } = useGetExtras();
  const deleteExtrasMutation = useDeleteExtras();
  const updateExtrasMutation = useUpdateExtras();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingExtra, setEditingExtra] = useState<EditingExtra | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);

  const filteredExtras = extras?.filter((extra) =>
    extra.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteExtras = (id: number) => {
    deleteExtrasMutation.mutate(id);
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

    if (!file || !editingExtra) {
      return;
    }

    const error = await validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsValidFile(true);
    setPreviewUrl(URL.createObjectURL(file));
    setEditingExtra({ ...editingExtra, image: file });
  };

  const startEditing = (extra: ProductExtras) => {
    setEditingExtra({
      id: extra.id,
      name: extra.name,
      description: extra.description || "",
      price: extra.price?.toString() || "",
      type: extra.type || TYPE_PRODUCT_ENUM.TYPE,
      weight: extra.weight?.toString() || "",
      currentImage: extra.image || "",
    });
    setPreviewUrl(null);
    setValidationError(null);
    setIsValidFile(false);
  };

  const handleUpdateExtras = () => {
    if (!editingExtra) return;

    const updateData: UpdateProductExtras = {
      name: editingExtra.name,
      description: editingExtra.description,
      price: parseFloat(editingExtra.price),
      type: editingExtra.type,
      weight: parseFloat(editingExtra.weight),
    };

    // Добавляем изображение только если выбрано новое
    if (editingExtra.image) {
      updateData.image = editingExtra.image;
    }

    updateExtrasMutation.mutate(
      { id: editingExtra.id, extras: updateData },
      {
        onSuccess: () => {
          setEditingExtra(null);
          setPreviewUrl(null);
          setValidationError(null);
          setIsValidFile(false);
        },
      }
    );
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Дополнительные продукты</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Поиск дополнительного продукта..."
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
            {filteredExtras?.map((extra) => (
              <TableRow key={extra.id}>
                <TableCell>
                  {extra.image ? (
                    <Image
                      src={extra.image}
                      alt={extra.name}
                      width={100}
                      height={100}
                    />
                  ) : (
                    <Card className="size-30 flex justify-center items-center border border-dashed border-muted-foreground/25">
                      <CameraOff className="w-14 h-14 text-muted-foreground " />
                    </Card>
                  )}
                </TableCell>
                <TableCell>{extra.name}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startEditing(extra)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Обновить дополнительный продукт{" "}
                          {editingExtra?.name || extra.name}
                        </DialogTitle>
                      </DialogHeader>
                      {editingExtra && (
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2 items-center">
                            <Label>Изображение</Label>
                            <Card
                              style={{
                                backgroundImage: `url(${previewUrl || editingExtra.currentImage})`,
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
                            <Label>Название</Label>
                            <Input
                              value={editingExtra.name}
                              onChange={(e) =>
                                setEditingExtra({
                                  ...editingExtra,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Введите название"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label>Описание</Label>
                            <Input
                              value={editingExtra.description}
                              onChange={(e) =>
                                setEditingExtra({
                                  ...editingExtra,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Введите описание"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label>Цена</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingExtra.price}
                              onChange={(e) =>
                                setEditingExtra({
                                  ...editingExtra,
                                  price: e.target.value,
                                })
                              }
                              placeholder="Введите цену"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label>Тип номенклатуры</Label>
                            <Select
                              value={editingExtra.type}
                              onValueChange={(value) =>
                                setEditingExtra({
                                  ...editingExtra,
                                  type: value as TYPE_PRODUCT_ENUM,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={
                                    editingExtra.type
                                      ? editingExtra.type
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
                              value={editingExtra.weight}
                              onChange={(e) =>
                                setEditingExtra({
                                  ...editingExtra,
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
                          onClick={handleUpdateExtras}
                          disabled={
                            !editingExtra ||
                            !editingExtra.name.trim() ||
                            !editingExtra.description.trim() ||
                            !editingExtra.price ||
                            isNaN(parseFloat(editingExtra.price)) ||
                            parseFloat(editingExtra.price) <= 0 ||
                            !editingExtra.weight ||
                            isNaN(parseFloat(editingExtra.weight)) ||
                            parseFloat(editingExtra.weight) <= 0 ||
                            (editingExtra.image && !isValidFile) ||
                            updateExtrasMutation.isPending
                          }
                        >
                          {updateExtrasMutation.isPending
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
                          Удалить дополнительный продукт {extra.name}?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteExtras(extra.id)}
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
  );
};

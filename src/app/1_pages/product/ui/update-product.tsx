"use client";

import { normalizeToHex } from "@/lib/utils";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { MultiSelect } from "../../../../components/ui/multiselect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { VARIANT_PRODUCT_ENUM } from "../enum/product-type.enum";
import { useGetGroups } from "../hooks/use-groups";
import { useGetGroupsSub } from "../hooks/use-groups-sub";
import { useGetProductIngredients } from "../hooks/use-ingredients";
import {
  useGetProductById,
  useGetProductExtras,
  useGetProductType,
  useUpdateProduct,
} from "../hooks/use-product";

interface FileValidationError {
  type: "format" | "dimensions" | "size";
  message: string;
}

interface UpdateProductProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateProduct = ({
  productId,
  isOpen,
  onClose,
}: UpdateProductProps) => {
  const [groupsEnabled, setGroupsEnabled] = useState(false);
  const [subGroupsEnabled, setSubGroupsEnabled] = useState(false);
  const [extrasEnabled, setExtrasEnabled] = useState(false);
  const [typesEnabled, setTypesEnabled] = useState(false);
  const [ingredientsEnabled, setIngredientsEnabled] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [composition, setComposition] = useState("");
  const [calories, setCalories] = useState("");
  const [proteins, setProteins] = useState("");
  const [fats, setFats] = useState("");
  const [carbohydrates, setCarbohydrates] = useState("");
  const [color, setColor] = useState("");

  // Состояния для мультиселектов
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedSubGroups, setSelectedSubGroups] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [variant, setVariant] = useState<VARIANT_PRODUCT_ENUM>(
    VARIANT_PRODUCT_ENUM.DEFAULT
  );
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: product } = useGetProductById(productId);
  const { data: groups } = useGetGroups(groupsEnabled);
  const { data: subGroups } = useGetGroupsSub(subGroupsEnabled);
  const { data: extras } = useGetProductExtras(extrasEnabled);
  const { data: types } = useGetProductType(typesEnabled);
  const { data: ingredients } = useGetProductIngredients(ingredientsEnabled);
  const updateProductMutation = useUpdateProduct();

  // Заполняем поля данными продукта при загрузке
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.information?.description || "");
      setComposition(product.information?.composition || "");
      setCalories(product.information?.calories?.toString() || "");
      setProteins(product.information?.proteins?.toString() || "");
      setFats(product.information?.fats?.toString() || "");
      setCarbohydrates(product.information?.carbohydrates?.toString() || "");
      setColor(product.color || "#000000");
      setVariant(product.variant || VARIANT_PRODUCT_ENUM.DEFAULT);

      // Включаем загрузку всех данных сразу
      setGroupsEnabled(true);
      setSubGroupsEnabled(true);
      setExtrasEnabled(true);
      setTypesEnabled(true);
      setIngredientsEnabled(true);
    }
  }, [product]);

  // Устанавливаем selected значения после загрузки данных groups
  useEffect(() => {
    if (product?.groups && groups && groups.length > 0) {
      setSelectedGroups(
        product.groups
          .filter((g) => g.id !== null && g.id !== undefined)
          .map((g) => g.id.toString())
      );
    }
  }, [product?.groups, groups]);

  // Устанавливаем selected значения после загрузки данных subgroups
  useEffect(() => {
    if (product?.subgroups && subGroups && subGroups.length > 0) {
      setSelectedSubGroups(
        product.subgroups
          .filter((sub) => sub.id !== null && sub.id !== undefined)
          .map((sub) => sub.id.toString())
      );
    }
  }, [product?.subgroups, subGroups]);

  // Устанавливаем selected значения после загрузки данных extras
  useEffect(() => {
    if (product?.extras && extras && extras.length > 0) {
      setSelectedExtras(
        product.extras
          .filter((e) => e.id !== null && e.id !== undefined)
          .map((e) => e.id.toString())
      );
    }
  }, [product?.extras, extras]);

  // Устанавливаем selected значения после загрузки данных types
  useEffect(() => {
    if (product?.type && types && types.length > 0) {
      setSelectedTypes(
        product.type
          .filter((t) => t.id !== null && t.id !== undefined)
          .map((t) => t.id.toString())
      );
    }
  }, [product?.type, types]);

  // Устанавливаем selected значения после загрузки данных ingredients
  useEffect(() => {
    if (product?.ingredients && ingredients && ingredients.length > 0) {
      setSelectedIngredients(
        product.ingredients
          .filter((i) => i.id !== null && i.id !== undefined)
          .map((i) => i.id.toString())
      );
    }
  }, [product?.ingredients, ingredients]);

  const validateFile = async (
    file: File
  ): Promise<FileValidationError | null> => {
    // Проверка формата
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        type: "format",
        message: "Поддерживаются только файлы формата JPEG, PNG и WebP",
      };
    }

    // Проверка размера файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        type: "size",
        message: `Размер файла слишком большой: ${(file.size / 1024 / 1024).toFixed(2)} MB. Максимум: 10 MB`,
      };
    }

    // Для изображений проверяем разрешение
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        // Минимальное разрешение для качественного фото продукта
        if (img.width < 1000 || img.height < 1000) {
          resolve({
            type: "dimensions",
            message: `Изображение слишком маленькое: ${img.width}x${img.height}px. Минимум: 1000x1000px`,
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setValidationError(null);
    setIsValidFile(false);
    setPreviewUrl(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    const error = await validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    // Если валидация прошла успешно
    setIsValidFile(true);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateProduct = () => {
    if (!product) return;

    const updateData = {
      name: name.trim() || product.name || "",
      description: description.trim() || product.information?.description || "",
      composition: composition.trim() || product.information?.composition || "",
      calories: calories
        ? parseFloat(calories)
        : product.information?.calories || 0,
      proteins: proteins
        ? parseFloat(proteins)
        : product.information?.proteins || 0,
      fats: fats ? parseFloat(fats) : product.information?.fats || 0,
      carbohydrates: carbohydrates
        ? parseFloat(carbohydrates)
        : product.information?.carbohydrates || 0,
      color: normalizeToHex(color.trim() || product.color || "#000000"),
      groups: selectedGroups
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id)),
      subgroups: selectedSubGroups
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id)),
      extras: selectedExtras
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id)),
      type: selectedTypes.map((id) => parseInt(id)).filter((id) => !isNaN(id)),
      ingredients: selectedIngredients
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id)),
      variant: variant,
      image: selectedFile || undefined,
    };

    updateProductMutation.mutate({
      idProduct: productId,
      productData: updateData,
    });

    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Обновить продукт {product?.name}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="space-y-4">
            <div className="flex justify-center items-center">
              {product?.image ? (
                <Card
                  onClick={handlePhotoClick}
                  style={{
                    backgroundImage: `url(${product.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="size-[250px]"
                ></Card>
              ) : (
                <Card
                  onClick={handlePhotoClick}
                  className="size-[250px] flex justify-center items-center border-2 border-dashed border-muted-foreground/25"
                >
                  <Camera className="w-16 h-16 text-muted-foreground " />
                </Card>
              )}

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Название</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Введите новое название"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Описание</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Введите новое название"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Состав</Label>
                    <Textarea
                      value={composition}
                      onChange={(e) => setComposition(e.target.value)}
                      placeholder="Введите новый состав"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Цвет</Label>
                    <Input
                      className="w-[120px] h-[110px]"
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const normalizedColor = normalizeToHex(e.target.value);
                        setColor(normalizedColor);
                      }}
                      placeholder="Введите новое название"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Вариант продукта</Label>
                    <Select
                      value={variant}
                      onValueChange={(value) =>
                        setVariant(value as VARIANT_PRODUCT_ENUM)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите вариант продукта" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={VARIANT_PRODUCT_ENUM.DEFAULT}>
                          Обычный (default)
                        </SelectItem>
                        <SelectItem value={VARIANT_PRODUCT_ENUM.BIG}>
                          Большой (big)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Пищевая ценность</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Каллории</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder="Введите новую калорийность"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Белки</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={proteins}
                      onChange={(e) => setProteins(e.target.value)}
                      placeholder="Введите новую белковую ценность"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Жиры</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={fats}
                      onChange={(e) => setFats(e.target.value)}
                      placeholder="Введите новую жировую ценность"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Углеводы</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={carbohydrates}
                      onChange={(e) => setCarbohydrates(e.target.value)}
                      placeholder="Введите новую углеводную ценность"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Группы</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Группы</Label>
                    <MultiSelect
                      maxCount={4}
                      options={
                        groups?.map((group) => ({
                          value: group?.id.toString(),
                          label: group?.name,
                        })) || []
                      }
                      value={selectedGroups}
                      onValueChange={setSelectedGroups}
                      isLoading={groupsEnabled && !groups}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Подгруппы</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Подгруппы</Label>
                    <MultiSelect
                      maxCount={4}
                      options={
                        subGroups?.map((group) => ({
                          value: group?.id.toString(),
                          label: group?.name,
                        })) || []
                      }
                      value={selectedSubGroups}
                      onValueChange={setSelectedSubGroups}
                      isLoading={subGroupsEnabled && !subGroups}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Добавки</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Добавки</Label>
                    <MultiSelect
                      maxCount={4}
                      options={
                        extras?.map((group) => ({
                          value: group?.id.toString(),
                          label: group?.name,
                        })) || []
                      }
                      value={selectedExtras}
                      onValueChange={setSelectedExtras}
                      isLoading={extrasEnabled && !extras}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Тип продукта</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Тип продукта</Label>
                    <MultiSelect
                      maxCount={4}
                      options={
                        types?.map((group) => ({
                          value: group?.id.toString(),
                          label: group?.name,
                        })) || []
                      }
                      value={selectedTypes}
                      onValueChange={setSelectedTypes}
                      isLoading={typesEnabled && !types}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ингредиенты</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Ингредиенты</Label>
                    <MultiSelect
                      maxCount={4}
                      options={
                        ingredients?.map((group) => ({
                          value: group?.id.toString(),
                          label: group?.name,
                        })) || []
                      }
                      value={selectedIngredients}
                      onValueChange={setSelectedIngredients}
                      isLoading={ingredientsEnabled && !ingredients}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Кнопка сохранения */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleUpdateProduct}
                disabled={updateProductMutation.isPending}
                className="w-full"
              >
                {updateProductMutation.isPending
                  ? "Сохранение..."
                  : "Сохранить изменения"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

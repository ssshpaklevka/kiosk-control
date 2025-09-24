"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { normalizeToHex } from "@/lib/utils";
import { AlertCircle, Camera, CheckCircle, Image, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Label } from "../../../../components/ui/label";
import { VARIANT_PRODUCT_ENUM } from "../enum/product-type.enum";
import { useGetGroups } from "../hooks/use-groups";
import { useGetGroupsSub } from "../hooks/use-groups-sub";
import { useGetProductIngredients } from "../hooks/use-ingredients";
import {
  useCreateProduct,
  useGetProductExtras,
  useGetProductType,
} from "../hooks/use-product";
import { CreateProduct } from "../types/product.dto";

interface FileValidationError {
  type: "format" | "dimensions" | "size";
  message: string;
}

export const CreatedProduct = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProduct = useCreateProduct();

  // Состояние формы
  const [formData, setFormData] = useState<Omit<CreateProduct, "image">>({
    name: "",
    description: "",
    variant: VARIANT_PRODUCT_ENUM.DEFAULT,
    groups: [],
    subGroups: [],
    extras: [],
    ingredients: [],
    type: [],
    composition: "",
    calories: 0,
    proteins: 0,
    fats: 0,
    carbohydrates: 0,
    color: "#000000", // Дефолтный HEX цвет
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Функция валидации формы
  const validateForm = (): boolean => {
    if (!selectedFile || !isValidFile) {
      toast.error("Необходимо загрузить изображение продукта");
      return false;
    }

    if (!formData.name.trim()) {
      toast.error("Название продукта обязательно");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Описание продукта обязательно");
      return false;
    }

    if (!formData.composition.trim()) {
      toast.error("Состав продукта обязателен");
      return false;
    }

    if (formData.groups.length === 0) {
      toast.error("Необходимо выбрать хотя бы одну группу");
      return false;
    }

    if (formData.subGroups.length === 0) {
      toast.error("Необходимо выбрать хотя бы одну подгруппу");
      return false;
    }

    if (formData.ingredients.length === 0) {
      toast.error("Необходимо выбрать хотя бы один ингредиент");
      return false;
    }

    if (formData.type.length === 0) {
      toast.error("Необходимо выбрать хотя бы один тип продукта");
      return false;
    }

    // Проверка числовых значений
    if (formData.calories <= 0) {
      toast.error("Калории должны быть больше 0");
      return false;
    }

    if (formData.proteins < 0) {
      toast.error("Белки не могут быть отрицательными");
      return false;
    }

    if (formData.fats < 0) {
      toast.error("Жиры не могут быть отрицательными");
      return false;
    }

    if (formData.carbohydrates < 0) {
      toast.error("Углеводы не могут быть отрицательными");
      return false;
    }

    // Валидация HEX цвета
    if (formData.color && !/^#[0-9A-F]{6}$/i.test(formData.color)) {
      toast.error("Цвет должен быть в HEX формате (#RRGGBB)");
      return false;
    }

    return true;
  };

  // Функция отправки формы
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Создаем объект данных с файлом напрямую
      const productData: CreateProduct = {
        ...formData,
        color: normalizeToHex(formData.color), // Убеждаемся, что цвет в HEX формате
        // Преобразуем строки в числа для всех массивов
        groups: formData.groups.map(Number).filter((n) => !isNaN(n)),
        subGroups: formData.subGroups.map(Number).filter((n) => !isNaN(n)),
        extras: formData.extras.map(Number).filter((n) => !isNaN(n)),
        ingredients: formData.ingredients.map(Number).filter((n) => !isNaN(n)),
        type: formData.type.map(Number).filter((n) => !isNaN(n)),
        image: selectedFile!,
      };

      await createProduct.mutateAsync(productData);

      // Сброс формы
      setFormData({
        name: "",
        description: "",
        variant: VARIANT_PRODUCT_ENUM.DEFAULT,
        groups: [],
        subGroups: [],
        extras: [],
        ingredients: [],
        type: [],
        composition: "",
        calories: 0,
        proteins: 0,
        fats: 0,
        carbohydrates: 0,
        color: "#000000", // Дефолтный HEX цвет
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsValidFile(false);
    } catch (error) {
      console.error("Ошибка создания продукта:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Состояния для ленивой загрузки данных
  const [ingredientsEnabled, setIngredientsEnabled] = useState(false);
  const [groupsEnabled, setGroupsEnabled] = useState(false);
  const [subGroupsEnabled, setSubGroupsEnabled] = useState(false);
  const [typesEnabled, setTypesEnabled] = useState(false);
  const [extrasEnabled, setExtrasEnabled] = useState(false);
  const { data: extras } = useGetProductExtras(extrasEnabled);
  const { data: ingredients } = useGetProductIngredients(ingredientsEnabled);
  const { data: groups } = useGetGroups(groupsEnabled);
  const { data: subGroups } = useGetGroupsSub(subGroupsEnabled);
  const { data: types } = useGetProductType(typesEnabled);
  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="text-2xl font-semibold">Добавить продукт</h2>

      <div className="flex flex-col gap-12">
        {/* Фото продукта */}
        <div className="grid grid-cols-2 gap-14">
          <div className="flex flex-col gap-4 items-center">
            <h3 className="text-lg w-full text-left font-medium">
              Фото продукта <span className="text-red-500">*</span>
            </h3>
            <Card
              className="relative w-90 h-80 bg-muted/30 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer group overflow-hidden"
              onClick={handlePhotoClick}
            >
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Предпросмотр продукта"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Изменить фото</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground group-hover:text-foreground transition-colors">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">Добавить фото</p>
                  <p className="text-sm text-center px-4">
                    Нажмите чтобы выбрать изображение продукта
                  </p>
                  <p className="text-xs text-center px-4 mt-2 text-muted-foreground/70">
                    JPEG, PNG или WebP, до 10MB
                  </p>
                </div>
              )}
            </Card>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Альтернативная кнопка загрузки */}
            <Button
              onClick={handlePhotoClick}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {selectedFile ? "Изменить фото" : "Выбрать фото"}
            </Button>

            {/* Информация о файле */}
            {selectedFile && (
              <div className="p-3 border rounded-md bg-muted/20">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* Ошибка валидации */}
            {validationError && (
              <div className="flex items-start gap-2 p-3 border border-destructive rounded-md bg-destructive/10">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm text-destructive">
                  <p className="font-medium">Ошибка валидации</p>
                  <p>{validationError.message}</p>
                </div>
              </div>
            )}

            {/* Успешная валидация */}
            {isValidFile && (
              <div className="flex items-start gap-2 p-3 border border-green-500 rounded-md bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700 dark:text-green-400">
                  <p className="font-medium">Фото готово</p>
                  <p>Изображение соответствует требованиям</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-xl">Товар</p>
            <p className="font-semibold">
              (Красный квадрат указывает на то, для чего будет применено
              изменение)
            </p>
            <div
              className="w-96 h-78 bg-accent bg-no-repeat bg-center bg-cover rounded-2xl"
              style={{
                backgroundImage: "url(/terminal-admin/terminal/header.webp)",
              }}
            >
              <div className="w-full flex rounded-3xl">
                <div
                  style={{
                    backgroundImage: previewUrl
                      ? `url(${previewUrl})`
                      : undefined,
                  }}
                  className="w-[121px] h-[85px] ml-[107px] mt-[170px] bg-red-600 rounded-2xl bg-cover bg-center bg-no-repeat"
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Информация о продукте */}
        <div className="flex-1 min-w-80 flex flex-col gap-4">
          <h3 className="text-lg font-medium">Информация о продукте</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium  block">
                Название продукта <span className="text-red-500">*</span>
              </p>
              <Input
                placeholder="Введите название продукта"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium  block">
                Описание <span className="text-red-500">*</span>
              </p>
              <Textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Введите описание продукта"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Вариант продукта</Label>
              <Select
                value={formData.variant}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    variant: value as VARIANT_PRODUCT_ENUM,
                  }))
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

            <div className="flex flex-col gap-2">
              <Label>Цвет заднего фона продукта</Label>
              <Input
                type="color"
                className="w-[150px] h-[130px]"
                value={formData.color}
                onChange={(e) => {
                  const normalizedColor = normalizeToHex(e.target.value);
                  setFormData((prev) => ({ ...prev, color: normalizedColor }));
                }}
              />
              {formData.color && (
                <div className="text-xs text-muted-foreground">
                  Выбранный цвет: {formData.color}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium  block">
                  Калории <span className="text-red-500">*</span>
                </p>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.calories || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      calories:
                        Math.round((Number(e.target.value) || 0) * 100) / 100,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium  block">Белки</p>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.proteins || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      proteins:
                        Math.round((Number(e.target.value) || 0) * 100) / 100,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium  block">Жиры</p>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.fats || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fats:
                        Math.round((Number(e.target.value) || 0) * 100) / 100,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium  block">Углеводы</p>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.carbohydrates || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      carbohydrates:
                        Math.round((Number(e.target.value) || 0) * 100) / 100,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p>
                Ингредиенты <span className="text-red-500">*</span>
              </p>
              <MultiSelect
                maxCount={4}
                options={
                  ingredients?.map((ingredient) => ({
                    value: ingredient.id.toString(),
                    label: ingredient.name,
                  })) || []
                }
                value={formData.ingredients.map(String)}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    ingredients: value.map(Number).filter((n) => !isNaN(n)),
                  }));
                }}
                onOpenChange={(open) => {
                  if (open && !ingredientsEnabled) {
                    setIngredientsEnabled(true);
                  }
                }}
                isLoading={ingredientsEnabled && !ingredients}
              />
            </div>

            <div className="flex flex-col gap-2">
              <p>Добавки</p>
              <MultiSelect
                maxCount={4}
                options={
                  extras?.map((extra) => ({
                    value: extra.id.toString(),
                    label: extra.name,
                  })) || []
                }
                value={formData.extras.map(String)}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    extras: value.map(Number).filter((n) => !isNaN(n)),
                  }));
                }}
                onOpenChange={(open) => {
                  if (open && !extrasEnabled) {
                    setExtrasEnabled(true);
                  }
                }}
                isLoading={extrasEnabled && !extras}
              />
            </div>

            <div className="flex flex-col gap-2">
              <p>
                Состав продукта <span className="text-red-500">*</span>
              </p>
              <Textarea
                value={formData.composition}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    composition: e.target.value,
                  }))
                }
                placeholder="Введите состав продукта"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p>
                Тип продукта <span className="text-red-500">*</span>
              </p>
              <MultiSelect
                maxCount={4}
                options={
                  types?.map((type) => ({
                    value: type.id.toString(),
                    label: type.name,
                  })) || []
                }
                value={formData.type.map(String)}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    type: value.map(Number).filter((n) => !isNaN(n)),
                  }));
                }}
                placeholder="Выберите типы продукта"
                onOpenChange={(open) => {
                  if (open && !typesEnabled) {
                    setTypesEnabled(true);
                  }
                }}
                isLoading={typesEnabled && !types}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p>
                Группы продукта <span className="text-red-500">*</span>
              </p>
              <MultiSelect
                maxCount={4}
                options={
                  groups?.map((group) => ({
                    value: group.id.toString(),
                    label: group.name,
                  })) || []
                }
                value={formData.groups.map(String)}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    groups: value.map(Number).filter((n) => !isNaN(n)),
                  }));
                }}
                onOpenChange={(open) => {
                  if (open && !groupsEnabled) {
                    setGroupsEnabled(true);
                  }
                }}
                isLoading={groupsEnabled && !groups}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p>
                Подгруппы продукта <span className="text-red-500">*</span>
              </p>
              <MultiSelect
                maxCount={4}
                options={
                  subGroups?.map((group) => ({
                    value: group.id.toString(),
                    label: group.name,
                  })) || []
                }
                value={formData.subGroups.map(String)}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    subGroups: value.map(Number).filter((n) => !isNaN(n)),
                  }));
                }}
                onOpenChange={(open) => {
                  if (open && !subGroupsEnabled) {
                    setSubGroupsEnabled(true);
                  }
                }}
                isLoading={subGroupsEnabled && !subGroups}
              />
            </div>

            <Button
              className="w-full"
              disabled={
                !isValidFile ||
                isSubmitting ||
                !formData.name.trim() ||
                !formData.description.trim() ||
                !formData.composition.trim() ||
                formData.groups.length === 0 ||
                formData.subGroups.length === 0 ||
                formData.ingredients.length === 0 ||
                formData.type.length === 0 ||
                formData.calories <= 0
              }
              onClick={handleSubmit}
            >
              {isSubmitting ? "Создание продукта..." : "Сохранить продукт"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Camera, CheckCircle, Image, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { Textarea } from "../../../../components/ui/textarea";
import { TYPE_PRODUCT_ENUM } from "../enum/product-type.enum";
import {
  useGetGroupOriginal,
  useGetProductOriginal,
  useUpdateProduct,
} from "../hooks/use-product";

interface FileValidationError {
  type: "format" | "dimensions" | "size";
  message: string;
}

export const RenameProduct = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productType, setProductType] = useState<string>("");
  const [productWeight, setProductWeight] = useState<number>(0);
  // State для работы с файлами
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGroupSelect = (value: string) => {
    setSelectedGroup(value);
    setSelectedProduct(""); // Сбрасываем выбранный продукт при смене группы
    setProductName("");
  };

  const handleProductSelect = (value: string) => {
    setSelectedProduct(value);

    if (value) {
      // Находим выбранный продукт и устанавливаем его имя
      const product = productOriginal?.find(
        (p) => p.id_product.toString() === value
      );
      if (product) {
        setProductName(product.name_original);
      }
    } else {
      setProductName("");
    }
  };
  const { data: groupOriginal } = useGetGroupOriginal();
  const { data: productOriginal } = useGetProductOriginal(selectedGroup);
  const updateProduct = useUpdateProduct();

  // Сброс формы после успешного обновления
  React.useEffect(() => {
    if (updateProduct.isSuccess) {
      setSelectedGroup("");
      setSelectedProduct("");
      setProductName("");
      setProductDescription("");
      setProductPrice(0);
      setProductWeight(0);
      setProductType("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsValidFile(false);
      setValidationError(null);
    }
  }, [updateProduct.isSuccess]);

  // Функции для работы с файлами
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
        if (img.width < 400 || img.height < 400) {
          resolve({
            type: "dimensions",
            message: `Изображение слишком маленькое: ${img.width}x${img.height}px. Минимум: 400x400px`,
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
  const handleProductTypeSelect = (value: string) => {
    setProductType(value);
  };
  const handleUpdateProduct = () => {
    console.log("🔄 Попытка обновления продукта:", {
      selectedProduct,
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      productPrice,
      productType,
      productWeight,
      hasFile: !!selectedFile,
    });

    if (
      selectedProduct &&
      productName.trim() &&
      productDescription.trim() &&
      productPrice &&
      productType &&
      productWeight
    ) {
      updateProduct.mutate({
        idProduct: Number(selectedProduct),
        productData: {
          name: productName,
          description: productDescription,
          price: productPrice,
          image: selectedFile || undefined, // Файл необязательный
          type: productType,
          weight: productWeight,
        },
      });
    } else {
      console.log("❌ Не все поля заполнены");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Отредактировать продукт</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Левая колонка - форма */}
        <div className="flex flex-col justify-center gap-4">
          <div className="flex flex-col gap-2">
            <p>Выберите группу, в которой хотите найти продукт</p>
            <Select onValueChange={handleGroupSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите группу, в которой хотите найти продукт" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {groupOriginal?.map((product) => (
                    <SelectItem
                      key={product.group_code}
                      value={product.group_code}
                    >
                      {product.group_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <p>Выберите продукт, который хотите переименовать</p>
            <Select onValueChange={handleProductSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите продукт, который хотите переименовать" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {productOriginal?.map((product) => (
                    <SelectItem
                      key={product.id_product}
                      value={product.id_product.toString()}
                    >
                      {product.name_original}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <p>
              Введите новое название продукта, которое будет отображаться в
              каталоге
            </p>
            <Input
              placeholder={
                selectedProduct
                  ? "Редактируйте название продукта"
                  : "Сначала выберите продукт"
              }
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
              }}
              disabled={!selectedProduct}
            />
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Изначальное название:{" "}
                <span className="font-medium">
                  {
                    productOriginal?.find(
                      (p) => p.id_product.toString() === selectedProduct
                    )?.name_original
                  }
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p>Введите новое описание продукта</p>
            <Textarea
              disabled={!selectedProduct}
              placeholder={
                selectedProduct
                  ? "Введите новое описание продукта"
                  : "Сначала выберите продукт"
              }
              value={productDescription}
              onChange={(e) => {
                setProductDescription(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p>Введите новую цену продукта</p>
            <Input
              type="number"
              disabled={!selectedProduct}
              placeholder={
                selectedProduct
                  ? "Введите новую цену продукта"
                  : "Сначала выберите продукт"
              }
              value={productPrice === 0 ? "" : productPrice}
              onChange={(e) => {
                const value = e.target.value;
                setProductPrice(value === "" ? 0 : Number(value));
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p>Тип продукта</p>
            <Select onValueChange={handleProductTypeSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите размер карточки" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={TYPE_PRODUCT_ENUM.TYPE}>
                    {TYPE_PRODUCT_ENUM.TYPE ? "Тип" : ""}
                  </SelectItem>
                  <SelectItem value={TYPE_PRODUCT_ENUM.EXTRAS}>
                    {TYPE_PRODUCT_ENUM.EXTRAS ? "Добавка" : ""}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <p>Введите новую массу продукта</p>
            <Input
              type="number"
              disabled={!selectedProduct}
              placeholder={
                selectedProduct
                  ? "Введите новую массу продукта"
                  : "Сначала выберите продукт"
              }
              value={productWeight === 0 ? "" : productWeight}
              onChange={(e) => {
                const value = e.target.value;
                setProductWeight(value === "" ? 0 : Number(value));
              }}
            />
          </div>

          {updateProduct.error && (
            <div className="text-sm text-red-500">
              Ошибка: {updateProduct.error.message}
            </div>
          )}

          <Button
            onClick={handleUpdateProduct}
            disabled={
              !selectedProduct ||
              !productName.trim() ||
              !productDescription.trim() ||
              !productPrice ||
              !productWeight ||
              !productType ||
              updateProduct.isPending
            }
          >
            {updateProduct.isPending ? "Обновление..." : "Обновить"}
          </Button>
        </div>

        {/* Правая колонка - фото */}
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium text-left">Фото продукта</h3>

          <Card
            className="relative w-[356px] h-80 bg-muted/30 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer group overflow-hidden"
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

          <Button
            onClick={handlePhotoClick}
            variant="outline"
            className="w-[356px]"
          >
            <Upload className="w-4 h-4 mr-2" />
            {selectedFile ? "Изменить фото" : "Выбрать фото"}
          </Button>

          {selectedFile && (
            <div className="p-3 border rounded-md bg-muted/20">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {validationError && (
            <div className="flex items-start gap-2 p-3 border border-destructive rounded-md bg-destructive/10">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Ошибка валидации</p>
                <p>{validationError.message}</p>
              </div>
            </div>
          )}

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
      </div>
    </div>
  );
};

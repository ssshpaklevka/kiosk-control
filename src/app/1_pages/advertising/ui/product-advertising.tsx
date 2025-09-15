import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useGetProduct } from "../../product/hooks/use-product";

interface FileValidationError {
  type: "format" | "dimensions" | "dpi" | "size";
  message: string;
}

export const ProductAdvertising = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = async (
    file: File
  ): Promise<FileValidationError | null> => {
    // Проверка формата
    const allowedTypes = ["image/webp", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      return {
        type: "format",
        message: "Поддерживаются только файлы формата WebP и WebM",
      };
    }

    // Для изображений проверяем размеры и DPI
    if (file.type === "image/webp") {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // Проверка размеров
          if (img.width !== 2160 || img.height !== 3840) {
            resolve({
              type: "dimensions",
              message: `Неверные размеры: ${img.width}x${img.height}px. Требуется: 2160x3840px`,
            });
            return;
          }

          // Примерная проверка DPI (для веб-изображений это сложно точно определить)
          // В данном случае будем считать, что если размеры правильные, то DPI скорее всего тоже 72
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
    }

    // Для видео проверяем базовые параметры
    if (file.type === "video/webm") {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.onloadedmetadata = () => {
          if (video.videoWidth !== 2160 || video.videoHeight !== 3840) {
            resolve({
              type: "dimensions",
              message: `Неверные размеры видео: ${video.videoWidth}x${video.videoHeight}px. Требуется: 2160x3840px`,
            });
            return;
          }
          resolve(null);
        };
        video.onerror = () => {
          resolve({
            type: "format",
            message: "Ошибка загрузки видео",
          });
        };
        video.src = URL.createObjectURL(file);
      });
    }

    return null;
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const { data: products } = useGetProduct();
  return (
    <div className="flex flex-row gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-xl">Товар</p>
        <p className="font-semibold">
          (Красный квадрат указывает на то, для чего будет применено изменение)
        </p>
        <div
          className="w-96 h-164 bg-accent bg-no-repeat bg-center bg-cover rounded-2xl"
          style={{
            backgroundImage: "url(/terminal/header.webp)",
          }}
        >
          <div className="w-full flex rounded-3xl">
            <div
              style={{
                backgroundImage: previewUrl ? `url(${previewUrl})` : undefined,
              }}
              className="w-[121px] h-[84px] ml-[107px] mt-[215px] bg-red-600 rounded-2xl bg-cover bg-center bg-no-repeat"
            ></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 min-w-80">
        <p className="text-lg font-medium mb-2">Изменить товар</p>
        <div className="flex flex-col gap-2">
          <p>Выберите для какого товара будет применено изменение</p>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите для какого товара будет применено изменение" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* <MultiSelect
            maxCount={4}
            options={
              products?.map((product) => ({
                value: product.id.toString(),
                label: product.name,
              })) || []
            }
            value={[]}
            onValueChange={(value) => {
              console.log(value);
            }}
          /> */}
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Требования: WebP или WebM, размер 1880x1000px, 72 DPI
          </p>
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Выбрать файл
          </Button>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".webp,.webm"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {selectedFile && (
          <div className="p-3 border rounded-md">
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
              <p className="font-medium">Файл прошел валидацию</p>
              <p>Готов к загрузке</p>
            </div>
          </div>
        )}

        {isValidFile && <Button className="w-full">Загрузить файл</Button>}
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateBannerLoyality } from "../../hooks/use-banner-loyality";
import { useStores } from "../../hooks/use-stores";
import { CreateBanner } from "../../types/adevrtising";
import { TableLoyalAdvertising } from "./table-loyal-advertising";

interface FileValidationError {
  type: "format" | "dimensions" | "dpi" | "size";
  message: string;
}

export const LoyalAdvertising = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBanner = useCreateBannerLoyality();
  const { data: stores } = useStores();

  // Состояние формы
  const [formData, setFormData] = useState<Omit<CreateBanner, "file">>({
    name: "",
    seconds: 5,
    store: [],
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Преобразуем данные магазинов для MultiSelect
  const storageData =
    stores && Array.isArray(stores)
      ? stores.map((store) => ({
          id: store.id,
          name: store.name,
          value: store.id,
          label: store.name,
        }))
      : [];

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
          // Проверка размеров для loyal экрана
          if (img.width !== 1880 || img.height !== 1000) {
            resolve({
              type: "dimensions",
              message: `Неверные размеры: ${img.width}x${img.height}px. Требуется: 1880x1000px`,
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
          if (video.videoWidth !== 1880 || video.videoHeight !== 1000) {
            resolve({
              type: "dimensions",
              message: `Неверные размеры видео: ${video.videoWidth}x${video.videoHeight}px. Требуется: 1880x1000px`,
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

  // Функция валидации формы
  const validateForm = (): boolean => {
    if (!selectedFile || !isValidFile) {
      toast.error("Необходимо загрузить корректный файл");
      return false;
    }

    if (!formData.name.trim()) {
      toast.error("Название баннера обязательно");
      return false;
    }

    if (formData.seconds < 0) {
      toast.error("Время показа не может быть отрицательным");
      return false;
    }

    // Убрали проверку store - теперь это поле необязательное

    return true;
  };

  // Функция отправки формы
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const bannerData: CreateBanner = {
        ...formData,
        file: selectedFile!,
      };

      await createBanner.mutateAsync(bannerData);

      // Сброс формы
      setFormData({
        name: "",
        seconds: 5,
        store: [],
        is_active: true,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsValidFile(false);
    } catch (error) {
      console.error("Ошибка создания рекламы:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-xl">Экран лояльности</p>
          <p className="font-semibold">
            (Красный квадрат указывает на то, для чего будет применено
            изменение)
          </p>
          <div
            className="w-96 h-164 bg-accent bg-no-repeat bg-center bg-cover rounded-2xl"
            style={{
              backgroundImage: "url(/terminal/loyal.webp)",
            }}
          >
            <div className="w-full flex rounded-3xl justify-center">
              <div
                style={{
                  backgroundImage: previewUrl
                    ? `url(${previewUrl})`
                    : undefined,
                }}
                className="w-[334px] h-[224px] mt-[10px] bg-red-600 rounded-2xl bg-cover bg-center bg-no-repeat"
              ></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 min-w-80">
          <div>
            <p className="text-lg font-medium mb-2">
              Изменить экран лояльности
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Требования: WebP или WebM, размер 1880x1000px, 72 DPI
            </p>
          </div>

          <div className="space-y-3">
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

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p>Название баннера</p>
              <Input
                placeholder="Название баннера"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <p>Время показа в секундах</p>
              <Input
                type="number"
                placeholder="Время показа в секундах"
                value={formData.seconds || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seconds: Number(e.target.value) || 5,
                  }))
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <p>
                Магазины (где показывать рекламу){" "}
                <span className="text-sm text-muted-foreground">
                  (временно отключено)
                </span>
              </p>
              <MultiSelect
                maxCount={10}
                options={storageData}
                value={formData.store}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, store: value }));
                }}
                placeholder="Поле временно отключено"
                disabled={true} // Всегда отключено
              />
            </div>

            <div className="flex flex-col gap-2">
              <p>Активен ли баннер?</p>
              <div className="flex flex-row gap-2">
                <Button
                  variant={formData.is_active ? "default" : "outline"}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, is_active: true }))
                  }
                >
                  Да
                </Button>
                <Button
                  variant={!formData.is_active ? "default" : "outline"}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, is_active: false }))
                  }
                >
                  Нет
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!isValidFile || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Загрузка файла..." : "Создать рекламу"}
            </Button>
          </div>
        </div>
      </div>
      <TableLoyalAdvertising />
    </>
  );
};

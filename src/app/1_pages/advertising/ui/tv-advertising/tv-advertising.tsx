import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { useCreateBannerTv } from "../../hooks/use-banner-tv";
import { useStores } from "../../hooks/use-stores";
import { CreateBannerTv } from "../../types/adevrtising";
import { TableTvAdvertising } from "./table-tv-advertising";

interface FileValidationError {
  type: "format" | "dimensions" | "dpi" | "size";
  message: string;
}

export const TvAdvertising = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBanner = useCreateBannerTv();
  const { data: stores } = useStores(); // Убрали isLoadingStores, так как не используем

  // Состояние формы
  const [formData, setFormData] = useState<Omit<CreateBannerTv, "file">>({
    name: "",
    seconds: 5,
    store: [], // Можно оставить пустым массивом или убрать совсем
    is_active: true,
    tv_number: 1, // По умолчанию ТВ 1
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
    // Проверяем только формат файла
    const allowedTypes = ["image/webp", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      return {
        type: "format",
        message: "Поддерживаются только файлы формата WebP и WebM",
      };
    }

    return null;
  };

  // Проверка размеров файла в зависимости от выбранного ТВ
  const validateFileDimensions = async (
    file: File,
    tvNumber: number
  ): Promise<boolean> => {
    let requiredWidth: number;
    const requiredHeight: number = 2160;

    if (tvNumber === 1) {
      // ТВ 1
      requiredWidth = 3840;
    } else if (tvNumber === 2) {
      // ТВ 2
      requiredWidth = 2184;
    } else {
      toast.error("Выберите номер ТВ");
      return false;
    }

    if (file.type === "image/webp") {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width !== requiredWidth || img.height !== requiredHeight) {
            toast.error(
              `Неверные размеры: ${img.width}x${img.height}px. Требуется: ${requiredWidth}x${requiredHeight}px для ТВ ${tvNumber}`
            );
            resolve(false);
            return;
          }
          resolve(true);
        };
        img.onerror = () => {
          toast.error("Ошибка загрузки изображения");
          resolve(false);
        };
        img.src = URL.createObjectURL(file);
      });
    }

    if (file.type === "video/webm") {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.onloadedmetadata = () => {
          if (
            video.videoWidth !== requiredWidth ||
            video.videoHeight !== requiredHeight
          ) {
            toast.error(
              `Неверные размеры видео: ${video.videoWidth}x${video.videoHeight}px. Требуется: ${requiredWidth}x${requiredHeight}px для ТВ ${tvNumber}`
            );
            resolve(false);
            return;
          }
          resolve(true);
        };
        video.onerror = () => {
          toast.error("Ошибка загрузки видео");
          resolve(false);
        };
        video.src = URL.createObjectURL(file);
      });
    }

    return true;
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

  const handleSecondsChange = (value: string) => {
    const cleanValue = value.replace(/^0+/, "") || "0";
    const numericValue = parseInt(cleanValue, 10);

    if (!isNaN(numericValue) && numericValue >= 0) {
      setFormData((prev) => ({
        ...prev,
        seconds: numericValue,
      }));
    } else if (cleanValue === "") {
      setFormData((prev) => ({
        ...prev,
        seconds: 0,
      }));
    }
  };

  // Функция валидации формы
  const validateForm = async (): Promise<boolean> => {
    if (!selectedFile) {
      toast.error("Необходимо загрузить файл");
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

    if (formData.tv_number > 2 || formData.tv_number < 1) {
      toast.error("Номер ТВ должен быть 1 или 2");
      return false;
    }

    // Проверяем размеры файла
    const isDimensionsValid = await validateFileDimensions(
      selectedFile,
      formData.tv_number
    );
    if (!isDimensionsValid) {
      return false;
    }

    return true;
  };

  // Функция отправки формы
  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const bannerData: CreateBannerTv = {
        ...formData,
        file: selectedFile!,
      };

      await createBanner.mutateAsync(bannerData);

      // Сброс формы
      setFormData({
        name: "",
        seconds: 5,
        store: [], // Оставляем пустым массивом
        is_active: true,
        tv_number: 1, // Сбрасываем на ТВ 1
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
          <p className="text-xl">Реклама на ТВ</p>
          <Card
            style={{
              backgroundImage: previewUrl
                ? `url(${previewUrl})`
                : "url(/terminal-admin/terminal/home.webp)",
            }}
            className="w-96 h-164 bg-accent bg-no-repeat bg-center bg-cover"
          ></Card>
        </div>
        <div className="flex flex-col gap-4 min-w-80">
          <div>
            <p className="text-lg font-medium mb-2">Изменить рекламу на ТВ</p>
            <p className="text-sm text-muted-foreground mb-4">
              Требования: WebP или WebM, размер{" "}
              {formData.tv_number === 1 ? (
                <span className="text-red-500 text-[16px] font-semibold">
                  3840x2160px для ТВ 1
                </span>
              ) : formData.tv_number === 2 ? (
                <span className="text-red-500 text-[16px] font-semibold">
                  2184x2160px для ТВ 2
                </span>
              ) : (
                "выберите ТВ"
              )}
              , 72 DPI
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
                value={
                  formData.seconds === 0 ? "" : formData.seconds.toString()
                }
                onChange={(e) => handleSecondsChange(e.target.value)}
                placeholder="Время показа в секундах"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p>Номер ТВ</p>
              <Select
                value={formData.tv_number.toString()}
                onValueChange={(value) => {
                  const tvNumber = parseInt(value, 10);
                  setFormData((prev) => ({ ...prev, tv_number: tvNumber }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите номер ТВ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Array.from({ length: 2 }, (_, index) => (
                      <SelectItem
                        key={index + 1}
                        value={(index + 1).toString()}
                      >
                        ТВ {index + 1}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                value={(formData.store || []).map(String)}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    store: value.map(Number),
                  }));
                }}
                placeholder="Поле временно отключено"
                disabled={true}
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
              disabled={!selectedFile || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Загрузка файла..." : "Создать рекламу"}
            </Button>
          </div>
        </div>
      </div>
      <TableTvAdvertising />
    </>
  );
};

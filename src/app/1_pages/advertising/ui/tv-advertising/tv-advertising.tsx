/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { useCreateBannerTv, useGetCountTv } from "../../hooks/use-banner-tv";
import { useStores } from "../../hooks/use-stores";
import { CreateBannerTv } from "../../types/adevrtising";
import { TableTvAdvertising } from "./table-tv-advertising";

interface FileValidationError {
  type: "format" | "dimensions" | "dpi" | "size";
  message: string;
}

export const TvAdvertising = () => {
  type TvFormData = Omit<CreateBannerTv, "file" | "tv_number"> & {
    tv_number: number | null;
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBanner = useCreateBannerTv();
  const { data: stores } = useStores(); // Убрали isLoadingStores, так как не используем

  // Состояние формы
  const [formData, setFormData] = useState<TvFormData>({
    name: "",
    seconds: 5,
    store: [], // Можно оставить пустым массивом или убрать совсем
    is_active: true,
    tv_number: null,
  });

  const { data: countTv } = useGetCountTv(Number(formData?.store?.[0]));

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Преобразуем данные магазинов для MultiSelect
  const storageData =
    stores && Array.isArray(stores)
      ? stores.map((store) => ({
        id: store.id,
        name: store.name,
        value: String(store.id),
        label: store.name,
      }))
      : [];

  const validateFileFormat = (file: File): FileValidationError | null => {
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
    tvNumber: number | null
  ): Promise<FileValidationError | null> => {
    let requiredWidth: number;
    const requiredHeight: number = 1080;

    if (tvNumber === 2) {
      requiredWidth = 1092;
    } else if (tvNumber) {
      requiredWidth = 1920;
    } else {
      return { type: "dimensions", message: "Выберите номер ТВ" };
    }

    const checkDimensions = (w: number, h: number) => {
      if (w !== requiredWidth || h !== requiredHeight) {
        return {
          type: "dimensions" as const,
          message: `Размер ${w}x${h}px не подходит. Требуется: ${requiredWidth}x${requiredHeight}px для ТВ ${tvNumber}`,
        };
      }
      return null;
    };

    if (file.type === "image/webp") {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve(checkDimensions(img.width, img.height));
        };
        img.onerror = () => {
          resolve({ type: "format", message: "Ошибка загрузки изображения" });
        };
        img.src = URL.createObjectURL(file);
      });
    }

    if (file.type === "video/webm") {
      return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata"; // Важно для загрузки метаданных
        video.onloadedmetadata = () => {
          resolve(checkDimensions(video.videoWidth, video.videoHeight));
        };
        video.onerror = () => {
          resolve({ type: "format", message: "Ошибка загрузки видео" });
        };
        video.src = URL.createObjectURL(file);
      });
    }

    return null;
  };

  // Общая функция запуска всех валидаций
  const runAllValidations = async (file: File, tvNumber: number | null) => {
    setValidationError(null);
    setIsValidFile(false);

    // 1. Формат
    const formatError = validateFileFormat(file);
    if (formatError) {
      setValidationError(formatError);
      return false;
    }

    // 2. Размеры
    const dimError = await validateFileDimensions(file, tvNumber);
    if (dimError) {
      setValidationError(dimError);
      return false;
    }

    setIsValidFile(true);
    return true;
  };

  // Обработчик выбора файла
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
    setPreviewUrl(URL.createObjectURL(file));

    // Запускаем валидацию
    await runAllValidations(file, formData.tv_number);
  };

  // 3. Эффект: Перевалидация при смене ТВ (если файл уже выбран)
  useEffect(() => {
    if (selectedFile) {
      runAllValidations(selectedFile, formData.tv_number);
    }
  }, [formData.tv_number]); // Зависимость от номера ТВ

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

  const handleSubmit = async () => {
    if (formData.tv_number === null) {
      toast.error("Необходимо выбрать номер ТВ");
      return;
    }

    // Финальная проверка перед отправкой
    if (!selectedFile) {
      toast.error("Необходимо загрузить файл");
      return;
    }

    if (!formData.store || formData.store.length < 1) {
      toast.error("Необходимо выбрать хотя бы один магазин");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Название баннера обязательно");
      return;
    }

    // Повторно запускаем валидацию, чтобы убедиться, что все ок
    const isValid = await runAllValidations(selectedFile, formData.tv_number);
    if (!isValid) {
      toast.error("Исправьте ошибки валидации файла");
      return;
    }

    setIsSubmitting(true);

    try {
      const bannerData: CreateBannerTv = {
        ...formData,
        tv_number: formData.tv_number,
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
      if (fileInputRef.current) fileInputRef.current.value = ""; // Сброс инпута
      toast.success("Реклама успешно создана");
    } catch (error) {
      console.error("Ошибка создания рекламы:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(formData);

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
            className="w-96 h-164 bg-accent bg-no-repeat bg-center bg-cover border relative"
          >
            {validationError && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <AlertCircle className="text-red-500 w-12 h-12" />
              </div>
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-4 min-w-80">
          <p className="text-lg font-medium">Изменить рекламу на ТВ</p>
          <div className="flex flex-col gap-2">
            <p>
              Магазин
            </p>
            <MultiSelect
              singleSelect
              maxCount={1}
              showSelectAll={false}
              options={storageData}
              value={(formData.store || []).map(String)}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  store: value,
                }));
                setFormData((prev) => ({
                  ...prev,
                  tv_number: null,
                }));
              }}
              placeholder="Выберите магазин"
            />
          </div>

          {countTv && countTv > 0 ? (
            <div className="flex flex-col gap-2">
              <p>Номер ТВ</p>
              <Select
                value={formData.tv_number ? formData.tv_number.toString() : ""}
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
                    {Array.from({ length: countTv }, (_, index) => (
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
          ) : (
            <p className="text-sm text-muted-foreground">
              Нет доступных ТВ
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Требования: WebP или WebM, размер{" "}
            {formData.tv_number && formData.tv_number !== 2 ? (
              <span className="text-red-500 text-[16px] font-semibold">
                1920x1080px для ТВ {formData.tv_number}
              </span>
            ) : formData.tv_number ? (
              <span className="text-red-500 text-[16px] font-semibold">
                1092x1080px для ТВ 2
              </span>
            ) : (
              "выберите ТВ"
            )}
            , 72 DPI
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleUploadClick}
              variant="outline"
              disabled={!formData.tv_number}
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

          {isValidFile && !validationError && (
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
              disabled={!selectedFile || !!validationError || isSubmitting}
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

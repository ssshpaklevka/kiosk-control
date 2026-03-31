/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  AlertCircle,
  CameraOff,
  CheckCircle,
  Pencil,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../components/ui/dialog";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { MultiSelect } from "../../../../../components/ui/multiselect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import {
  useDeleteBannerTv,
  useGetBannersTv,
  useUpdateBannerTv,
} from "../../hooks/use-banner-tv";
import { useStores } from "../../hooks/use-stores";
import { BannerTv, UpdateBannerTvDto } from "../../types/adevrtising";

interface FileValidationError {
  type: "format" | "dimensions" | "dpi" | "size";
  message: string;
}

// Интерфейс для состояния редактирования с is_active
interface EditingBannerTv extends Omit<BannerTv, "isActive"> {
  is_active: boolean;
}

export const TableTvAdvertising = () => {
  const { data: banners } = useGetBannersTv();
  const { data: stores } = useStores();
  const { mutate: updateBanner } = useUpdateBannerTv();
  const { mutate: deleteBanner } = useDeleteBannerTv();
  const [editingBanner, setEditingBanner] = useState<EditingBannerTv | null>(
    null
  );
  const [updatedBannerIds, setUpdatedBannerIds] = useState<Set<string>>(
    new Set()
  );

  // Состояние для валидации файлов
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogBannerId, setDialogBannerId] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<string[]>([]);

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

  const validateFileDimensions = async (
    file: File,
    tvNumber: number
  ): Promise<FileValidationError | null> => {
    let requiredWidth: number;
    const requiredHeight: number = 1080;

    if (tvNumber === 2) {
      requiredWidth = 1092;
    } else if (tvNumber) {
      requiredWidth = 1920;
    } else {
      return { type: "dimensions", message: "Неверный номер ТВ" };
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
        const img = new window.Image();
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
        video.preload = "metadata";
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

  // Общий запуск валидации
  const runAllValidations = async (file: File, tvNumber: number) => {
    setValidationError(null);
    setIsValidFile(false);

    // Проверка формата
    const formatError = validateFileFormat(file);
    if (formatError) {
      setValidationError(formatError);
      return false;
    }

    // Проверка размеров
    const dimError = await validateFileDimensions(file, tvNumber);
    if (dimError) {
      setValidationError(dimError);
      return false;
    }

    setIsValidFile(true);
    return true;
  };

  // Перевалидация при смене ТВ в модалке (если файл выбран)
  useEffect(() => {
    if (selectedFile && editingBanner) {
      runAllValidations(selectedFile, editingBanner.tvNumber);
    }
  }, [editingBanner?.tvNumber]);

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

    if (editingBanner) {
      await runAllValidations(file, editingBanner.tvNumber);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner?.id) {
      toast.error("ID баннера не найден");
      return;
    }

    if (!editingBanner.name.trim()) {
      toast.error("Название баннера обязательно");
      return;
    }

    if (editingBanner.seconds < 0) {
      toast.error("Время показа не может быть отрицательным");
      return;
    }

    if (!editingBanner.store || editingBanner.store.length < 1) {
      toast.error("Необходимо выбрать хотя бы один магазин");
      return;
    }

    // Если выбран новый файл, но он не прошел валидацию - не отправляем
    if (selectedFile && !isValidFile) {
      toast.error("Выбранный файл не соответствует требованиям");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: {
        name: string;
        seconds: number;
        is_active: boolean;
        file?: File;
        tv_number: number;
        store: string[];
      } = {
        name: editingBanner.name,
        seconds: editingBanner.seconds,
        is_active: editingBanner.is_active,
        tv_number: editingBanner.tvNumber,
        store: editingBanner.store.map(String),
      };

      // Если загружен новый файл, добавляем его
      if (selectedFile && isValidFile) {
        updateData.file = selectedFile;
      }

      const finalData: UpdateBannerTvDto = {
        name: updateData.name,
        seconds: Number(updateData.seconds),
        is_active: updateData.is_active,
        tv_number: updateData.tv_number,
        store: updateData.store,
        ...(updateData.file && { file: updateData.file }),
      };

      await updateBanner({
        id: Number(editingBanner.id),
        data: finalData,
      });

      // Если обновили изображение, добавляем ID баннера в список обновленных
      if (selectedFile && isValidFile && editingBanner.id) {
        setUpdatedBannerIds((prev) => new Set(prev).add(editingBanner.id!));
      }

      // Сброс состояния файла
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsValidFile(false);
      setValidationError(null);
      setEditingBanner(null);
      setIsDialogOpen(false); // Закрываем модалку после успешного обновления
      setDialogBannerId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Ошибка обновления баннера:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBanner = (banner: BannerTv) => {
    console.log(
      "Открытие модального окна для баннера с ID:",
      banner.id,
      "Название:",
      banner.name,
      "isActive:",
      banner.isActive
    ); // Добавляем логирование для отладки
    setEditingBanner({
      ...banner,
      // Маппим isActive из API в is_active для внутреннего состояния
      is_active: banner.isActive === true,
    } as EditingBannerTv);
    // Сброс состояния файла при открытии диалога
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsValidFile(false);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setDialogBannerId(Number(banner.id));
    setIsDialogOpen(true);
  };

  const handleSecondsChange = (value: string) => {
    const cleanValue = value.replace(/^0+/, "") || "0";
    const numericValue = parseInt(cleanValue, 10);

    if (!isNaN(numericValue) && numericValue >= 0) {
      setEditingBanner({
        ...editingBanner!,
        seconds: numericValue,
      });
    } else if (cleanValue === "") {
      setEditingBanner({
        ...editingBanner!,
        seconds: 0,
      });
    }
  };

  const handleDeleteBanner = (id: number) => {
    console.log("Удаление баннера с ID:", id); // Добавляем логирование для отладки
    deleteBanner(id);
  };

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


  return (
    <div className="h-screen flex flex-col">
      <Card className="flex flex-col mb-4">
        <CardHeader className="flex flex-col gap-4">
          <CardTitle>Список баннеров</CardTitle>
          <MultiSelect
            singleSelect
            showSelectAll={false}
            maxCount={1}
            className="w-max"
            options={storageData}
            value={selectedStore}
            onValueChange={(value) => {
              setSelectedStore(value);
            }}
            placeholder="Выберите магазин"
          />
        </CardHeader>
        <CardContent>
          {selectedStore.length > 0 && banners && banners.length > 0 ? (
            <Table className="text-center">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Изображение</TableHead>
                  <TableHead className="text-center">Название</TableHead>
                  <TableHead className="text-center">Время показа</TableHead>
                  <TableHead className="text-center">Активен</TableHead>
                  <TableHead className="text-center">Тип</TableHead>
                  <TableHead className="text-center">Номер ТВ</TableHead>
                  <TableHead className="text-center"></TableHead>
                  <TableHead className="text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners?.filter((banner) => banner.store?.includes(Number(selectedStore[0]))).map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex justify-center">
                        {banner.url ? (
                          banner.type === "video" ? (
                            <video
                              src={
                                updatedBannerIds.has(banner.id!)
                                  ? `${banner.url}?updated=${Date.now()}`
                                  : banner.url
                              }
                              className="size-[100px] object-cover rounded"
                              controls
                              key={`video-${banner.id}-${updatedBannerIds.has(banner.id!) ? Date.now() : "original"}`}
                            />
                          ) : (
                            <Image
                              src={
                                updatedBannerIds.has(banner.id!)
                                  ? `${banner.url}?updated=${Date.now()}`
                                  : banner.url
                              }
                              alt={banner.name}
                              width={100}
                              height={100}
                              key={`image-${banner.id}-${updatedBannerIds.has(banner.id!) ? Date.now() : "original"}`}
                              unoptimized={updatedBannerIds.has(banner.id!)} // Отключаем оптимизацию только для обновленных
                            />
                          )
                        ) : (
                          <Card className="size-[100px] flex justify-center items-center border border-dashed border-muted-foreground/25">
                            <CameraOff className="w-14 h-14 text-muted-foreground " />
                          </Card>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{banner.name}</TableCell>
                    <TableCell>{banner.seconds} секунд</TableCell>
                    <TableCell>
                      {banner.isActive === true ? "Да" : "Нет"}
                    </TableCell>
                    <TableCell>
                      {banner.type === "video" ? "Видео" : "Изображение"}
                    </TableCell>
                    <TableCell>{banner.tvNumber}</TableCell>       
                    <TableCell className="w-px whitespace-nowrap px-2">
                      <Dialog
                        open={
                          isDialogOpen && dialogBannerId === Number(banner.id)
                        }
                        onOpenChange={(open) => {
                          if (!open) {
                            setIsDialogOpen(false);
                            setDialogBannerId(null);
                            setEditingBanner(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditBanner(banner)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                          <DialogHeader className="overflow-hidden">
                            <DialogTitle className="truncate whitespace-pre-line">
                              Обновить баннер &quot;{banner.name}&quot;
                            </DialogTitle>
                          </DialogHeader>
                          {editingBanner && (
                            <>
                              <div className="flex flex-col gap-2">
                                <Label>Новое название баннера</Label>
                                <Input
                                  value={editingBanner.name}
                                  onChange={(e) =>
                                    setEditingBanner({
                                      ...editingBanner,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label>Новое время показа в секундах</Label>
                                <Input
                                  type="number"
                                  value={
                                    editingBanner.seconds === 0
                                      ? ""
                                      : editingBanner.seconds.toString()
                                  }
                                  onChange={(e) =>
                                    handleSecondsChange(e.target.value)
                                  }
                                  placeholder="Введите количество секунд"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label>Активен ли баннер?</Label>
                                <div className="flex flex-row gap-2">
                                  <Button
                                    type="button"
                                    variant={
                                      editingBanner.is_active
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      setEditingBanner({
                                        ...editingBanner,
                                        is_active: true,
                                      })
                                    }
                                  >
                                    Да
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={
                                      !editingBanner.is_active
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      setEditingBanner({
                                        ...editingBanner,
                                        is_active: false,
                                      })
                                    }
                                  >
                                    Нет
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label>Новое изображение</Label>
                                <p className="text-xs text-muted-foreground">
                                  Требуется: {editingBanner.tvNumber === 2 ? "1092x1080" : "1920x1080"} px
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

                                {selectedFile && (
                                  <div className="p-3 border rounded-md">
                                    <p className="text-sm font-medium">
                                      {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {(
                                        selectedFile.size /
                                        1024 /
                                        1024
                                      ).toFixed(2)}{" "}
                                      MB
                                    </p>
                                  </div>
                                )}

                                {validationError && (
                                  <div className="flex items-start gap-2 p-3 border border-destructive rounded-md bg-destructive/10">
                                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-destructive">
                                      <p className="font-medium">
                                        Ошибка валидации
                                      </p>
                                      <p>{validationError.message}</p>
                                    </div>
                                  </div>
                                )}

                                {isValidFile && !validationError && (
                                  <div className="flex items-start gap-2 p-3 border border-green-500 rounded-md bg-green-50 dark:bg-green-950/20">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-green-700 dark:text-green-400">
                                      <p className="font-medium">
                                        Файл прошел валидацию
                                      </p>
                                      <p>Готов к загрузке</p>
                                    </div>
                                  </div>
                                )}

                                {previewUrl && (
                                  <div className="flex flex-col gap-2">
                                    <Label className="text-lg font-semibold">
                                      Предварительный просмотр:
                                    </Label>
                                    <div>
                                      {selectedFile?.type === "video/webm" ? (
                                        <video
                                          src={previewUrl}
                                          className="w-full h-auto rounded-md"
                                          controls
                                        />
                                      ) : (
                                        <Image
                                          src={previewUrl}
                                          alt="Preview"
                                          width={400}
                                          height={400}
                                          className="w-full h-auto rounded-md"
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Button
                                  onClick={handleUpdateBanner}
                                  disabled={isSubmitting || (!!selectedFile && !isValidFile)}
                                  className="flex-1"
                                >
                                  {isSubmitting
                                    ? "Сохранение..."
                                    : "Сохранить изменения"}
                                </Button>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="w-px whitespace-nowrap px-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log(
                            "Нажата кнопка удаления для баннера с ID:",
                            banner.id,
                            "Название:",
                            banner.name
                          );
                          handleDeleteBanner(Number(banner.id));
                        }}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col">
              <p className="text-center">Нет баннеров</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

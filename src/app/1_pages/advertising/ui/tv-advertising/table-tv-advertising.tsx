"use client";

import {
  AlertCircle,
  CameraOff,
  CheckCircle,
  Pencil,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
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

  // Проверка формата файла
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
      toast.error("Неверный номер ТВ");
      return false;
    }

    if (file.type === "image/webp") {
      return new Promise((resolve) => {
        const img = new window.Image();
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

    if (editingBanner.tvNumber > 2 || editingBanner.tvNumber < 1) {
      toast.error("Номер ТВ должен быть 1 или 2");
      return;
    }

    // Проверяем размеры файла, если он загружен
    if (selectedFile && isValidFile) {
      const isDimensionsValid = await validateFileDimensions(
        selectedFile,
        editingBanner.tvNumber
      );
      if (!isDimensionsValid) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const updateData: {
        name: string;
        seconds: number;
        is_active: boolean;
        file?: File;
        tv_number: number;
      } = {
        name: editingBanner.name,
        seconds: editingBanner.seconds,
        is_active: editingBanner.is_active,
        tv_number: editingBanner.tvNumber,
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
        // НЕ передаем store, если он не нужен - пусть остается undefined
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
    setDialogBannerId(Number(banner.id)); // Устанавливаем ID баннера для диалога
    setIsDialogOpen(true); // Открываем модалку
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
  return (
    <div className="h-screen flex flex-col">
      <Card className="flex flex-col mb-4">
        <CardHeader>
          <CardTitle>Список баннеров</CardTitle>
        </CardHeader>
        <CardContent>
          {banners && banners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Изображение</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Время показа</TableHead>
                  {/* <TableHead>Активен</TableHead> */}
                  <TableHead>Тип</TableHead>
                  <TableHead>Номер ТВ</TableHead>
                  <TableHead>Обновить</TableHead>
                  <TableHead>Удалить</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners?.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{banner.name}</TableCell>
                    <TableCell>{banner.seconds} секунд</TableCell>
                    {/* <TableCell>
                      {banner.isActive === true ? "Да" : "Нет"}
                    </TableCell> */}
                    <TableCell>
                      {banner.type === "video" ? "Видео" : "Изображение"}
                    </TableCell>
                    <TableCell>{banner.tvNumber}</TableCell>
                    <TableCell>
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
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Обновить баннер &quot;{banner.name}&quot; ?
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
                                <Label>Новые номер ТВ</Label>
                                <Select
                                  value={
                                    editingBanner.tvNumber?.toString() || ""
                                  }
                                  onValueChange={(value) => {
                                    const newTvNumber = parseInt(value, 10);
                                    setEditingBanner({
                                      ...editingBanner,
                                      tvNumber: newTvNumber,
                                    });
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
                              {/* <div className="flex flex-col gap-2">
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
                              </div> */}
                              <div className="flex flex-col gap-2">
                                <Label>Новое изображение</Label>
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

                                {isValidFile && (
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
                                      Предварительный просмотр контента:
                                    </Label>
                                    <div>
                                      {selectedFile?.type === "video/webm" ? (
                                        <video
                                          src={previewUrl}
                                          className=""
                                          controls
                                        />
                                      ) : (
                                        <Image
                                          src={previewUrl}
                                          alt="Preview"
                                          width={400}
                                          height={400}
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Button
                                  onClick={handleUpdateBanner}
                                  disabled={isSubmitting}
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
                    <TableCell>
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
            <div className="flex flex-col gap-2">
              <p>Нет баннеров</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

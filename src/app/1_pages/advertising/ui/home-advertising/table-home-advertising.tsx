import {
  AlertCircle,
  CameraOff,
  CheckCircle,
  Pencil,
  Store,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { Fragment, useRef, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import {
  useDeleteBanner,
  useGetBannersMain,
  useUpdateBannerMain,
} from "../../hooks/use-banner-main";
import { BannerMain } from "../../types/adevrtising";
import { MultiSelect } from "../../../../../components/ui/multiselect";
import { useStores } from "../../hooks/use-stores";
import { Separator } from "../../../../../components/ui/separator";

interface FileValidationError {
  type: "format" | "dimensions" | "dpi" | "size";
  message: string;
}

export const TableHomeAdvertising = () => {
  const { data: banners } = useGetBannersMain();
  const { data: stores } = useStores();
  const { mutate: updateBanner } = useUpdateBannerMain();
  const { mutate: deleteBanner } = useDeleteBanner();
  const [editingBanner, setEditingBanner] = useState<BannerMain | null>(null);
  const [dialogBannerStore, setDialogBannerStore] = useState<number | null>(null);
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

  // Функция валидации файлов (аналогично HomeAdvertising)
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
        const img = new window.Image();
        img.onload = () => {
          // Проверка размеров
          if (img.width !== 2160 || img.height !== 3840) {
            resolve({
              type: "dimensions",
              message: `Неверные размеры: ${img.width}x${img.height}px. Требуется: 2160x3840px`,
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

  const handleUpdateBanner = async () => {
    if (!editingBanner?.id) {
      toast.error("ID баннера не найден");
      return;
    }

    if (!editingBanner.name.trim()) {
      toast.error("Название баннера обязательно");
      return;
    }

    if (!editingBanner.store || editingBanner.store.length < 1) {
      toast.error("Необходимо выбрать хотя бы один магазин");
      return;
    }

    if (editingBanner.seconds < 0) {
      toast.error("Время показа не может быть отрицательным");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: {
        name: string;
        seconds: number;
        store: string[];
        is_active: boolean;
        file?: File;
      } = {
        name: editingBanner.name,
        seconds: editingBanner.seconds,
        is_active: editingBanner.isActive,
        store: editingBanner.store,
      };

      // Если загружен новый файл, добавляем его
      if (selectedFile && isValidFile) {
        updateData.file = selectedFile;
      }

      const finalData = {
        name: updateData.name,
        seconds: Number(updateData.seconds),
        is_active: updateData.is_active,
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
    } catch (error) {
      console.error("Ошибка обновления баннера:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBanner = (banner: BannerMain) => {
    console.log(
      "Открытие модального окна для баннера с ID:",
      banner.id,
      "Название:",
      banner.name
    ); // Добавляем логирование для отладки
    setEditingBanner({ ...banner });
    // Сброс состояния файла при открытии диалога
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsValidFile(false);
    setValidationError(null);
    setDialogBannerId(Number(banner.id)); // Устанавливаем ID баннера для диалога
    setIsDialogOpen(true); // Открываем модалку
  };

  const handleShowStore = (banner: BannerMain) => {
    setDialogBannerStore(Number(banner.id));
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
        <CardHeader>
          <CardTitle>Список баннеров</CardTitle>
        </CardHeader>
        <CardContent>
          {banners && banners.length > 0 ? (
            <Table className="text-center">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Изображение</TableHead>
                  <TableHead className="text-center">Название</TableHead>
                  <TableHead className="text-center">Время показа</TableHead>
                  <TableHead className="text-center">Активен</TableHead>
                  <TableHead className="text-center">Тип</TableHead>
                  <TableHead className="text-center">Магазины</TableHead>
                  <TableHead className="text-center"></TableHead>
                  <TableHead className="text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners?.map((banner) => {
                  const isUpdated = updatedBannerIds.has(banner.id!);
                  const imageUrl = isUpdated
                    ? `${banner.url}?updated=${Date.now()}`
                    : banner.url;

                  return (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="flex justify-center">
                          {banner.url ? (
                            banner.type === "video" ? (
                              <video
                                src={imageUrl}
                                className="size-[100px] object-cover rounded"
                                controls
                                key={`video-${banner.id}-${isUpdated ? Date.now() : "original"}`}
                              />
                            ) : (
                              <Image
                                src={imageUrl}
                                alt={banner.name}
                                width={100}
                                height={100}
                                key={`image-${banner.id}-${isUpdated ? Date.now() : "original"}`}
                                unoptimized={isUpdated} // Отключаем оптимизацию только для обновленных
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
                      <TableCell>
                        <Dialog
                          open={
                            isDialogOpen && dialogBannerStore === Number(banner.id)
                          }
                          onOpenChange={(open) => {
                            if (!open) {
                              setIsDialogOpen(false);
                              setDialogBannerStore(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => handleShowStore(banner)}
                            >
                              <Store className="w-4 h-4" /> {banner.store?.length}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                            <DialogHeader className="overflow-hidden">
                              <DialogTitle className="truncate whitespace-pre-line">
                                Магазины для баннера &quot;{banner.name}&quot;
                              </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-2">
                              {banner.store && banner.store?.map((store, index) => (
                                <Fragment key={store}>
                                  <Separator />
                                  <span>{index + 1}. {stores?.find((s) => s.id === Number(store))?.name}</span>
                                </Fragment>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
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
                                  <p>
                                    Магазины (где показывать рекламу){" "}
                                  </p>
                                  <MultiSelect
                                    maxCount={1}
                                    options={storageData}
                                    value={(editingBanner.store || []).map(String)}
                                    onValueChange={(value) => {
                                      setEditingBanner((prev) => {
                                        if (!prev) return null;
                                        return {
                                          ...prev,
                                          store: value,
                                        }
                                      });
                                    }}
                                    placeholder="Выберите магазины"
                                  />
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Label>Активен ли баннер?</Label>
                                  <div className="flex flex-row gap-2">
                                    <Button
                                      type="button"
                                      variant={
                                        editingBanner.isActive
                                          ? "default"
                                          : "outline"
                                      }
                                      onClick={() =>
                                        setEditingBanner({
                                          ...editingBanner,
                                          isActive: true,
                                        })
                                      }
                                    >
                                      Да
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={
                                        !editingBanner.isActive
                                          ? "default"
                                          : "outline"
                                      }
                                      onClick={() =>
                                        setEditingBanner({
                                          ...editingBanner,
                                          isActive: false,
                                        })
                                      }
                                    >
                                      Нет
                                    </Button>
                                  </div>
                                </div>
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
                  );
                })}
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

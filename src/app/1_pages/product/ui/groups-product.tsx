import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Edit2,
  Image,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  useCreateGroup,
  useDeleteGroup,
  useGetGroups,
  useUpdateGroup,
} from "../hooks/use-groups";
import { CreateGroup, UpdateGroup } from "../types/group.dto";

interface FileValidationError {
  type: "format" | "dimensions" | "size";
  message: string;
}

export const GroupsProduct = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingGroup, setEditingGroup] = useState({
    name: "",
    image: new File([], "image.png"),
  });
  const [newGroup, setNewGroup] = useState({
    name: "",
    image: new File([], "image.png"),
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Состояния для загрузки изображений
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] =
    useState<FileValidationError | null>(null);
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: groups = [], isLoading, error } = useGetGroups();
  const { mutate: createGroup } = useCreateGroup();
  const { mutate: deleteGroup } = useDeleteGroup();
  const { mutate: updateGroup } = useUpdateGroup();
  // Отладочная информация

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Функция валидации файла
  const validateFile = async (
    file: File
  ): Promise<FileValidationError | null> => {
    // Проверка формата - только WebP
    if (file.type !== "image/webp") {
      return {
        type: "format",
        message: "Поддерживаются только файлы формата WebP",
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
        // Минимальное разрешение для качественного фото группы
        if (img.width < 500 || img.height < 500) {
          resolve({
            type: "dimensions",
            message: `Изображение слишком маленькое: ${img.width}x${img.height}px. Минимум: 500x500px`,
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

  const handleCreateGroup = () => {
    if (newGroup.name.trim() && selectedFile && isValidFile) {
      const newGroupData: CreateGroup = {
        name: newGroup.name,
        image: selectedFile,
      };
      createGroup(newGroupData);
      setNewGroup({ name: "", image: new File([], "image.png") });
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsValidFile(false);
      setValidationError(null);
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = (id: number) => {
    deleteGroup(id);
    setIsDeleting(false);
  };

  const handleUpdateGroup = (id: number) => {
    const groupData: UpdateGroup = {
      name: editingGroup.name,
      image:
        editingGroup.image instanceof File && editingGroup.image.size > 0
          ? editingGroup.image
          : undefined,
    };
    updateGroup({ id, group: groupData });
    setIsUpdating(false);
    setEditingGroup({ name: "", image: new File([], "image.png") });
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Группы продуктов</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать подгруппу
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Поиск групп..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Создание новой подгруппы */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Создать новую группу</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-14">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subgroup-name">Название группы</Label>
                  <Input
                    id="subgroup-name"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    placeholder="Введите название группы"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <Label>Изображение группы</Label>

                  {/* Область загрузки изображения */}
                  <Card
                    className="relative size-[250px] bg-muted/30 border-2  border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer group overflow-hidden"
                    style={{
                      backgroundImage: previewUrl
                        ? `url(${previewUrl})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    onClick={handlePhotoClick}
                  >
                    {previewUrl ? (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm font-medium">
                            Изменить изображение
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground group-hover:text-foreground transition-colors">
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Добавить изображение
                        </p>
                        <p className="text-sm text-center px-4">
                          Нажмите чтобы выбрать изображение группы
                        </p>
                        <p className="text-xs text-center px-4 mt-2 text-muted-foreground/70">
                          Только WebP формат, до 10MB (обязательно)
                        </p>
                      </div>
                    )}
                  </Card>

                  {/* Скрытый input для файла */}
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/webp"
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
                    {selectedFile
                      ? "Изменить изображение"
                      : "Выбрать изображение"}
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
                        <p className="font-medium">Изображение готово</p>
                        <p>Файл соответствует требованиям</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-4">
                  <p className="text-xl">Группа товаров</p>
                  <p className="font-semibold">
                    (Красный квадрат указывает на то, для чего будет применено
                    изменение)
                  </p>
                  <div
                    className="w-96 h-82 bg-accent bg-no-repeat bg-center bg-cover rounded-2xl"
                    style={{
                      backgroundImage:
                        "url(/terminal-admin/terminal/header.webp)",
                    }}
                  >
                    <div className="w-full flex rounded-3xl">
                      <div
                        style={{
                          backgroundImage: previewUrl
                            ? `url(${previewUrl})`
                            : undefined,
                        }}
                        className="w-[58px] h-[58px] ml-[32px] mt-[153px] bg-red-600 rounded-2xl bg-cover bg-center bg-no-repeat"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateGroup}
                disabled={
                  !newGroup.name.trim() || !selectedFile || !isValidFile
                }
              >
                Создать группу
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewGroup({ name: "", image: new File([], "image.png") });
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setIsValidFile(false);
                  setValidationError(null);
                }}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список подгрупп */}
      <div className="grid gap-4">
        {error ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-500">Ошибка загрузки: {error.message}</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Загрузка групп...</p>
            </CardContent>
          </Card>
        ) : filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? "Группы не найдены" : "Группы не созданы"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map((group) => (
            <Card key={group.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-lg">
                      <span className="font-semibold">Название: </span>
                      {group.name}
                    </p>
                    <div className="flex flex-col gap-2">
                      <p className="text-lg">
                        <span className="font-semibold">Изображение: </span>
                      </p>
                      <Card
                        style={{ backgroundImage: `url(${group.image})` }}
                        className="bg-cover bg-center size-[250px]"
                      ></Card>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={isUpdating}
                      onOpenChange={(open) => {
                        setIsUpdating(open);
                        if (open) {
                          setEditingGroup({
                            name: group.name,
                            image: new File([], "image.png"),
                          });
                        }
                      }}
                    >
                      <DialogTrigger>
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="flex flex-col gap-12">
                        <DialogHeader>
                          <DialogTitle>
                            Обновить группу &quot;{group.name}&quot; ?
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-2">
                          <Label>Новое название группы</Label>
                          <Input
                            value={editingGroup.name}
                            onChange={(e) =>
                              setEditingGroup({
                                ...editingGroup,
                                name: e.target.value,
                              })
                            }
                            placeholder="Введите новое название группы"
                          />
                        </div>
                        <DialogFooter className="flex justify-start!">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateGroup(group.id)}
                          >
                            Обновить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsUpdating(false)}
                          >
                            Отмена
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                      <DialogTrigger>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="flex flex-col gap-12">
                        <DialogHeader>
                          <DialogTitle>
                            Удалить группу &quot;{group.name}&quot; ?
                          </DialogTitle>
                        </DialogHeader>
                        <DialogFooter className="flex justify-start!">
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            Удалить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleting(false)}
                          >
                            Отмена
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

"use client";

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
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useCreateGroupSub,
  useDeleteGroupSub,
  useGetGroupsSub,
  useUpdateGroupSub,
} from "../hooks/use-groups-sub";
import { CreateGroupSub } from "../types/groups-sub.dto";

export const SubgroupsProduct = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [updatingSubGroupId, setUpdatingSubGroupId] = useState<number | null>(
    null
  );
  const [deletingSubGroupId, setDeletingSubGroupId] = useState<number | null>(
    null
  );
  const [groupSub, setGroupSub] = useState({
    name: "",
  });
  const [newSubGroup, setNewSubGroup] = useState({
    name: "",
  });
  const { data: subGroups = [], isLoading, error } = useGetGroupsSub();
  const { mutate: createGroupSub } = useCreateGroupSub();
  const { mutate: deleteGroupSub } = useDeleteGroupSub();
  const { mutate: updateGroupSub } = useUpdateGroupSub();
  // Отладочная информация

  const filteredSubGroups = subGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubGroup = () => {
    if (newSubGroup.name.trim()) {
      const newGroup: CreateGroupSub = {
        name: newSubGroup.name,
      };
      createGroupSub(newGroup);
      setNewSubGroup({ name: "" });
      // setIsCreating(false);
    }
  };

  const handleDeleteSubGroup = (id: number) => {
    deleteGroupSub(id);
    setDeletingSubGroupId(null);
  };

  const handleUpdateSubGroup = (id: number, groupSub: CreateGroupSub) => {
    updateGroupSub({ id, groupSub });
    setUpdatingSubGroupId(null);
    setGroupSub({ name: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Подгруппы продуктов</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать подгруппу
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Поиск подгрупп..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Создание новой подгруппы */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Создать новую подгруппу</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="subgroup-name">Название подгруппы</Label>
              <Input
                id="subgroup-name"
                value={newSubGroup.name}
                onChange={(e) =>
                  setNewSubGroup({ ...newSubGroup, name: e.target.value })
                }
                placeholder="Введите название подгруппы"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSubGroup}>Создать подгруппу</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewSubGroup({ name: "" });
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
              <p className="text-gray-500">Загрузка подгрупп...</p>
            </CardContent>
          </Card>
        ) : filteredSubGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? "Подгруппы не найдены" : "Подгруппы не созданы"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubGroups.map((group) => (
            <Card key={group.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={updatingSubGroupId === group.id}
                      onOpenChange={(open) =>
                        setUpdatingSubGroupId(open ? group.id : null)
                      }
                    >
                      <DialogTrigger>
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="flex flex-col gap-12">
                        <DialogHeader>
                          <DialogTitle>
                            Обновить подгруппу &quot;{group.name}&quot; ?
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-2">
                          <Label>Новое название подгруппы</Label>
                          <Input
                            value={groupSub.name}
                            onChange={(e) =>
                              setGroupSub({ ...groupSub, name: e.target.value })
                            }
                            placeholder="Введите новое название подгруппы"
                          />
                        </div>
                        <DialogFooter className="flex justify-start!">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateSubGroup(group.id, groupSub)
                            }
                          >
                            Обновить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUpdatingSubGroupId(null)}
                          >
                            Отмена
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={deletingSubGroupId === group.id}
                      onOpenChange={(open) =>
                        setDeletingSubGroupId(open ? group.id : null)
                      }
                    >
                      <DialogTrigger>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="flex flex-col gap-12">
                        <DialogHeader>
                          <DialogTitle>
                            Удалить подгруппу &quot;{group.name}&quot; ?
                          </DialogTitle>
                        </DialogHeader>
                        <DialogFooter className="flex justify-start!">
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubGroup(group.id)}
                          >
                            Удалить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingSubGroupId(null)}
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

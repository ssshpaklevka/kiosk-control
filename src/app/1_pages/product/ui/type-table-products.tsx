import { CameraOff, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../components/ui/alert-dialog";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { useDeleteTypes, useGetTypes } from "../hooks/use-type";

export const TypeTableProducts = () => {
  const { data: types, isLoading, error } = useGetTypes();
  const deleteTypesMutation = useDeleteTypes();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredTypes = types?.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDeleteTypes = (id: number) => {
    deleteTypesMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Типы продуктов</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Поиск типа продукта..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Изображение</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Удалить</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTypes?.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  {type.image ? (
                    <Image
                      src={type.image}
                      alt={type.name}
                      width={100}
                      height={100}
                    />
                  ) : (
                    <Card className="size-30 flex justify-center items-center border border-dashed border-muted-foreground/25">
                      <CameraOff className="w-14 h-14 text-muted-foreground " />
                    </Card>
                  )}
                </TableCell>
                <TableCell>{type.name}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Удалить тип продукта {type.name}?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteTypes(type.id)}
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

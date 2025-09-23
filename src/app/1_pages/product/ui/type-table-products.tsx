import { Trash2 } from "lucide-react";
import Image from "next/image";
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

  const handleDeleteTypes = (id: number) => {
    deleteTypesMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Типы продуктов</CardTitle>
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
            {types?.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  <Image
                    src={type.image}
                    alt={type.name}
                    width={100}
                    height={100}
                  />
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

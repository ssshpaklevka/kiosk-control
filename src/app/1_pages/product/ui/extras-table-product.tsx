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
import { useDeleteExtras, useGetExtras } from "../hooks/use-extras";

export const ExtrasTableProducts = () => {
  const { data: extras, isLoading, error } = useGetExtras();
  const deleteExtrasMutation = useDeleteExtras();

  const handleDeleteExtras = (id: number) => {
    deleteExtrasMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Дополнительные продукты</CardTitle>
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
            {extras?.map((extra) => (
              <TableRow key={extra.id}>
                <TableCell>
                  <Image
                    src={extra.image}
                    alt={extra.name}
                    width={100}
                    height={100}
                  />
                </TableCell>
                <TableCell>{extra.name}</TableCell>
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
                          Удалить дополнительный продукт {extra.name}?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteExtras(extra.id)}
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

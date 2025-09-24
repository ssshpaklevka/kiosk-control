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
import { useDeleteExtras, useGetExtras } from "../hooks/use-extras";

export const ExtrasTableProducts = () => {
  const { data: extras, isLoading, error } = useGetExtras();
  const deleteExtrasMutation = useDeleteExtras();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredExtras = extras?.filter((extra) =>
    extra.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDeleteExtras = (id: number) => {
    deleteExtrasMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Дополнительные продукты</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Поиск дополнительного продукта..."
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
            {filteredExtras?.map((extra) => (
              <TableRow key={extra.id}>
                <TableCell>
                  {extra.image ? (
                    <Image
                      src={extra.image}
                      alt={extra.name}
                      width={100}
                      height={100}
                    />
                  ) : (
                    <Card className="size-30 flex justify-center items-center border border-dashed border-muted-foreground/25">
                      <CameraOff className="w-14 h-14 text-muted-foreground " />
                    </Card>
                  )}
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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multiselect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USER_ROLE } from "../enum/role.enum";
import { Label } from "@/components/ui/label";

export const User = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Создание пользователя</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
            <Label>Почта</Label>
          <Input type="text" placeholder="Email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Фамилия</Label>
            <Input type="text" placeholder="Фамилия" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Имя</Label>
            <Input type="text" placeholder="Имя" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Отчество</Label>
            <Input type="text" placeholder="Отчество" />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label>Роль</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USER_ROLE.ADMIN}>Админ</SelectItem>
              <SelectItem value={USER_ROLE.MANAGER}>Менеджер</SelectItem>
              <SelectItem value={USER_ROLE.USER}>Пользователь</SelectItem>
            </SelectContent>
          </Select>
          </div>
          <Button>Создать</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

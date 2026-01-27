"use client";

import { FC, useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useStores } from "../../advertising/hooks/use-stores";
import { TYPE_PRODUCT_ENUM, TYPE_PRODUCT_NAME } from "../enum/product-type.enum";
import {
  useGetProductById
} from "../hooks/use-product";
import { usePrice, useUpdatePriceList } from "../hooks/use-price";
import { cn } from "../../../../lib/utils";

interface UpdatePriceProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface Price {
  idStore: number;
  price: number;
}

export const UpdatePrice: FC<UpdatePriceProps> = ({
  productId,
  isOpen,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [inputPrice, setInputPrice] = useState<Record<number, string>>({});
  const [prices, setPrices] = useState<Price[]>([]);
  const { data: stores } = useStores();
  const { data: product } = useGetProductById(productId);
  const { data: priceList } = usePrice(Number(selectedItem));
  const { mutate: updatePriceList } = useUpdatePriceList();

  useEffect(() => {
    if (priceList && selectedItem && priceList?.data?.length > 0) {
      priceList?.data?.forEach((priceData) => {
        setInputPrice((prev) => ({ ...prev, [priceData.idStore]: priceData.price.toString() }));
        setPrices((prev) => [...prev, { idStore: priceData.idStore, price: priceData.price }]);
      });
    }
  }, [priceList, selectedItem]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, idStore: number) => {
    const val = e.target.value;

    // Разрешаем цифры, опциональную точку и МАКСИМУМ 2 цифры после неё
    if (!/^\d*\.?\d{0,2}$/.test(val)) {
      return;
    }

    // Сохраняем значение в UI state
    setInputPrice((prev) => ({ ...prev, [idStore]: val }));

    // Если поле очистили -> удаляем цену из массива
    if (val === "") {
      setPrices((prev) => (prev || []).filter((p) => p.idStore !== idStore));
      return;
    }

    // Если число заканчивается на точку (напр. "150."), то не сохраняем в prices
    if (val.endsWith(".")) {
      return;
    }

    // Если всё ок, то сохраняем число в массив
    const numVal = parseFloat(val);
    setPrices((prev) => {
      const currentPrices = prev || [];
      const exists = currentPrices.some((p) => p.idStore === idStore);

      if (exists) {
        return currentPrices.map((p) =>
          p.idStore === idStore ? { ...p, price: numVal } : p
        );
      }
      return [...currentPrices, { idStore, price: numVal }];
    });
  };

  const handleSelectType = (value: string) => {
    setSelectedType(value);
    setSelectedItem("");
    setInputPrice({});
    setSearchValue("");
    setPrices([]);
  }

  const handleSelectItem = (value: string) => {
    setSelectedItem(value);
    setInputPrice({});
    setSearchValue("");
    setPrices([]);
  }

  const handleClose = () => {
    onClose();
    setSelectedType("");
    setSelectedItem("");
    setInputPrice({});
    setSearchValue("");
    setPrices([]);
  }

  const handleUpdatePrice = () => {
    if (!selectedItem || !productId) return;
    updatePriceList({
      id: productId,
      idProduct: Number(selectedItem),
      list: prices,
    });
  }

  const productItem = product?.[selectedType as TYPE_PRODUCT_ENUM];
  const filteredStores = stores?.filter((shop) => shop?.name.toLowerCase().includes(searchValue.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] min-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Обновить цены продукта {product?.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={(value) => handleSelectType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TYPE_PRODUCT_ENUM.EXTRAS}>Добавки</SelectItem>
                <SelectItem value={TYPE_PRODUCT_ENUM.TYPE}>Продукты</SelectItem>
              </SelectContent>
            </Select>
            {selectedType && (
              <Select value={selectedItem} onValueChange={(value) => handleSelectItem(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Выберите ${TYPE_PRODUCT_NAME[selectedType as TYPE_PRODUCT_ENUM]}`} />
                </SelectTrigger>
                <SelectContent>
                  {productItem && productItem?.filter((item) => item.id !== null)?.length !== 0 ?
                    productItem?.map((item) => (
                      <SelectItem key={item?.id} value={item?.id?.toString()}>{item?.name}</SelectItem>
                    )) : (
                      <SelectItem disabled value="empty">
                        Пусто
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            )}
          </div>
          {selectedItem &&
            <>
              {filteredStores && filteredStores?.length > 0 ? <div className="flex flex-col w-full items-center border-b">
                <div className="grid grid-cols-[1fr_150px] items-center py-2 w-full">
                  <span className="font-medium">Магазин</span>
                  <span className="font-medium">Цена</span>
                </div>
                <div className="max-h-[50vh] overflow-y-auto w-full">
                  {filteredStores?.map((shop) => (
                    <div key={shop?.id} className="grid grid-cols-[1fr_150px] gap-2 py-2 border-t w-full items-center">
                      <span className={cn("truncate", !inputPrice[shop.id] && "text-muted-foreground line-through")}>{shop?.name}</span>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          value={
                            inputPrice[shop.id]
                              ? inputPrice[shop.id]
                              : prices?.find((p) => p.idStore === shop.id)?.price ?? ""
                          }
                          onChange={(e) => handlePriceChange(e, shop.id)}
                          className="w-full"
                        />
                        <span className="text-sm text-muted-foreground pr-2">руб</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div> : <div className="flex py-8.5 border-b w-full items-center justify-center">
                <span className="text-muted-foreground">Магазины не найдены</span>
              </div>}
              <div className="flex gap-2 items-center">
                <Input type="text" className="w-full" placeholder="Поиск по магазину" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                <Button disabled={!selectedItem} onClick={handleUpdatePrice}>Обновить цены</Button>
              </div>
            </>
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};

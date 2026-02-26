import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { priceApi } from "../api/price-api";
import { PriceListDto, PriceListType } from "../types/type.dto";
import { toast } from "sonner";

export const usePrice = (idProduct: number) => {
    return useQuery<PriceListType, Error>({
        queryKey: ["price-list", idProduct],
        queryFn: () => priceApi.getPriceListByIdProduct(idProduct),
        enabled: !!idProduct,
    });
};

export const useUpdatePriceList = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, PriceListDto>({
      mutationFn: (priceList: PriceListDto) => priceApi.updatePriceList(priceList),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["price-list"] });
        toast.success("Список цен успешно обновлен");
      },
      onError: (error) => {
        toast.error(error.message || "Ошибка при обновлении списка цен");
      },
    });
  };
  
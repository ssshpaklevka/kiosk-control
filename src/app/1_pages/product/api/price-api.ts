import { apiClient } from "../../../3_features/api/api-client";
import { PriceListDto, PriceListType } from "../types/type.dto";

export const priceApi = {
    getPriceListByIdProduct: async (idProduct: number): Promise<PriceListType> => {
        const response = await apiClient.get(`/product-type/get-product-price-to-type/${idProduct}`);
        return response.data;
    },
    updatePriceList: async (priceList: PriceListDto) => {
        const response = await apiClient.patch("/product-type/update-price-list", priceList);
        return response.data;
    },
};
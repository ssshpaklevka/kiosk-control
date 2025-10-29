import { useQuery } from "@tanstack/react-query";
import { updateProductSetApi } from "../api/update-product-set";
import { UpdateProductSet } from "../types/update-product-set.dto";

export const useUpdateProductSet = () => {
  return useQuery<UpdateProductSet>({
    queryKey: ["update-product-set"],
    queryFn: updateProductSetApi.updateProductSet,
    placeholderData: { message: "" },
  });
};

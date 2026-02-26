import { TYPE_PRODUCT_ENUM } from "../enum/product-type.enum";

export interface ProductType {
  id: number;
  idProduct: number;
  name: string;
  image: string;
  description: string;
  type: TYPE_PRODUCT_ENUM;
  weight: number;
}

export interface UpdateProductType {
  name?: string;
  image?: File;
  description?: string;
  type?: TYPE_PRODUCT_ENUM;
  weight?: number;
}

export interface PriceListDto {
  id: number;
  idProduct: number;
  list:
  {
    idStore: number;
    price: number;
  }[];
}

export interface PriceListType {
  success: boolean;
  idProduct: number;
  data: {
    idStore: number;
    price: number;
  }[];
}

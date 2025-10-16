import { TYPE_PRODUCT_ENUM } from "../enum/product-type.enum";

export interface ProductType {
  id: number;
  name: string;
  image: string;
  description: string;
  price: number;
  type: TYPE_PRODUCT_ENUM;
  weight: number;
}

export interface UpdateProductType {
  name?: string;
  image?: File;
  description?: string;
  price?: number;
  type?: TYPE_PRODUCT_ENUM;
  weight?: number;
}

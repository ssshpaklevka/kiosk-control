import { VARIANT_PRODUCT_ENUM } from "../enum/product-type.enum";

export interface CreateProduct {
  name: string;
  image: File;
  description: string;
  variant: VARIANT_PRODUCT_ENUM;
  groups: number[]; // Сервер ожидает числа
  subGroups: number[]; // Сервер ожидает числа
  extras: number[]; // Сервер ожидает числа
  type: number[]; // Сервер ожидает числа
  ingredients: number[]; // Сервер ожидает числа
  composition: string;
  fats: number;
  proteins: number;
  carbohydrates: number;
  calories: number;
  color: string;
}

export interface UpdateProduct {
  name: string;
  description: string;
  image?: File;
  price: number;
  type: string;
  weight: number;
}

export interface GroupOriginal {
  group_code: string;
  group_name: string;
}

export interface ProductOriginal {
  id_product: number;
  name_original: string;
  ed: string;
  erpcode: string;
  deleted: boolean;
  group_code: string;
  vat: number;
  group_name: string;
  image: string;
  description: string;
  name: string;
}

export interface ProductIngredient {
  id: number;
  name: string;
  image: string;
}

export interface CreateProductIngredient {
  name: string;
}

export interface ProductType {
  id: number;
  name: string;
  image: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  variant: VARIANT_PRODUCT_ENUM;
  color: string;
  groups: {
    id: number;
    name: string;
  }[];
  subgroup: string[];
  extras: {
    id: number;
    name: string;
    price: number;
  }[];
  ingredients: string[];
  type: {
    id: number;
    name: string;
    price: number;
    weight: number;
  }[];
  information: {
    fats: number;
    proteins: number;
    carbohydrates: number;
    calories: number;
    composition: string;
    description: string;
  };
}

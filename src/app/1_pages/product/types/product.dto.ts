import {
  TYPE_PRODUCT_ENUM,
  VARIANT_PRODUCT_ENUM,
} from "../enum/product-type.enum";

export interface CreateProduct {
  name: string;
  image: File;
  description: string;
  variant: VARIANT_PRODUCT_ENUM;
  groups: number[];
  subGroups: number[];
  extras: number[];
  type: number[];
  ingredients: number[];
  composition: string;
  fats: number;
  proteins: number;
  carbohydrates: number;
  calories: number;
  color: string;
}

export interface UpdateProduct {
  name: string;
  image?: File;
  description: string;
  variant: VARIANT_PRODUCT_ENUM;
  groups: number[];
  subgroups: number[];
  extras: number[];
  type: number[];
  ingredients: number[];
  composition: string;
  fats: number;
  proteins: number;
  carbohydrates: number;
  calories: number;
  color: string;
}

export interface UpdateProductSet {
  // id: number;
  name: string;
  image?: File;
  description: string;
  price: number;
  weight: number;
  type: TYPE_PRODUCT_ENUM;
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
  subgroups: {
    id: number;
    name: string;
  }[];
  extras: {
    id: number;
    name: string;
    price: number;
    weight: number;
  }[];
  ingredients: {
    id: number;
    name: string;
  }[];
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

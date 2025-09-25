export interface Advertising {
  name: string;
  seconds: number;
  storage: string[];
  is_active: boolean;
  file: File;
}

// Типы для магазинов
export interface Store {
  id: string;
  name: string;
  address?: string;
  is_active?: boolean;
}

// Типы для баннеров главной страницы
export interface BannerMain {
  id?: string;
  name: string;
  seconds: number;
  store: string[]; // массив id магазинов
  is_active: boolean;
  type: string;
  url: string;
  updated_at?: string;
  create_at?: string;
}

export interface CreateBanner {
  name: string;
  seconds: number;
  store?: string[]; // Сделали необязательным
  is_active: boolean;
  file: File;
}

export interface UpdateBannerMainDto {
  name?: string;
  seconds?: number;
  store?: string[];
  is_active?: boolean;
  file?: File;
}

export interface BannerTv {
  id?: string;
  name: string;
  seconds: number;
  store: string[];
  isActive: boolean; // Изменено с is_active на isActive для соответствия API
  type: string;
  url: string;
  tvNumber: number;
}

export interface CreateBannerTv {
  name: string;
  seconds: number;
  store?: number[]; // Исправлено на number[]
  is_active: boolean;
  file: File;
  tv_number: number;
}

export interface UpdateBannerTvDto {
  name?: string;
  seconds?: number;
  store?: number[]; // Исправлено на number[]
  is_active?: boolean;
  file?: File;
  tv_number?: number;
}

// // Типы для баннера в шапке заказа
// export interface HeaderBanner {
//   id?: string;
//   name: string;
//   seconds: number;
//   store: string[]; // массив id магазинов
//   is_active: boolean;
//   file: string;
// }

// export interface CreateHeaderBannerDto {
//   name: string;
//   seconds: number;
//   store?: string[]; // Сделали необязательным
//   is_active: boolean;
//   file: File;
// }

// export interface UpdateHeaderBannerDto {
//   name?: string;
//   seconds?: number;
//   store?: string[];
//   is_active?: boolean;
//   file?: File;
// }

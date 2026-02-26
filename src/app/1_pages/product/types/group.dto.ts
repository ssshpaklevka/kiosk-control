export interface Group {
  id: number;
  name: string;
  image: File;
  store: string[];
}

export interface CreateGroup {
  name: string;
  image: File;
  store: string[];
}

export interface UpdateGroup {
  name: string;
  image?: File;
  store: string[];
}

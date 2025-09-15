export interface Group {
  id: number;
  name: string;
  image: File;
}

export interface CreateGroup {
  name: string;
  image: File;
}

export interface UpdateGroup {
  name: string;
  image?: File;
}

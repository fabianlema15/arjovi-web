export type PortfolioPhotoPublic = {
  id: string;
  caption: string;
  src: string;
};

export type PortfolioProjectPublic = {
  id: string;
  title: string;
  description: string;
  coverSrc: string | null;
  photos: PortfolioPhotoPublic[];
};

export type PortfolioPhotoAdmin = {
  id: string;
  caption: string;
  mediaType: string;
  sortOrder: number;
  src: string;
  createdAt: Date;
};

export type PortfolioProjectAdmin = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  photoCount: number;
  coverSrc: string | null;
};

export function publicPhotoSrc(id: string) {
  return `/api/portfolio/photos/${id}`;
}

export function adminPhotoSrc(id: string) {
  return `/api/quotes/projects/photos/${id}`;
}

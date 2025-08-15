export type Brand = {
  id: number;
  name: string;
  logoUrl: string | null;
  website: string | null;
  _count: {
    products: number;
  };
};

export type BrandFormValues = {
  name: string;
  logoUrl: string;
  website: string;
};

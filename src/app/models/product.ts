export interface Product {
  id?: number;
  name: string;
  details?: string;
  price?: number;
  carbonImpact?: number;
  ecoCertified?: boolean;
  ecoRequested?: boolean;
  sellerId?: number;
  imageUrl?: string | null;
}

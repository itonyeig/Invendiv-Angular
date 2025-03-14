import { ProductI } from "../product/product.interface";

export interface CartItemI {
  product: ProductI;
  quantity: number;
}

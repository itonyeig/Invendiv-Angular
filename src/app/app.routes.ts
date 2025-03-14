import { Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';
import { CartComponent } from './cart/cart.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductComponent, title: "Product" },
  { path: 'cart', component: CartComponent, title: "Cart" },
  { path: '**', redirectTo: 'products', pathMatch: 'full' }
];


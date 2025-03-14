import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductI } from '../product/product.interface';
import { CartItemI } from './cart.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'cartItems';

  private cartSubject: BehaviorSubject<CartItemI[]>;

  public cartItems$;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    let initialCart: CartItemI[] = [];

    // Only access localStorage if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      initialCart = storedCart ? JSON.parse(storedCart) : [];
    }

    this.cartSubject = new BehaviorSubject<CartItemI[]>(initialCart);
    this.cartItems$ = this.cartSubject.asObservable();
  }

  addToCart(product: ProductI, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const index = currentCart.findIndex(item => item.product.id === product.id);

    if (index > -1) {
      currentCart[index].quantity += quantity;
    } else {
      currentCart.push({ product, quantity });
    }
    this.updateCart(currentCart);
  }

  updateQuantity(productId: number, newQuantity: number): void {
    let currentCart = this.cartSubject.value;
    const index = currentCart.findIndex(item => item.product.id === productId);
    if (index > -1) {
      if (newQuantity <= 0) {
        currentCart.splice(index, 1);
      } else {
        currentCart[index].quantity = newQuantity;
      }
      this.updateCart(currentCart);
    }
  }

  removeFromCart(productId: number): void {
    const updatedCart = this.cartSubject.value.filter(item => item.product.id !== productId);
    this.updateCart(updatedCart);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  private updateCart(newCart: CartItemI[]): void {
    this.cartSubject.next(newCart);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(newCart));
    }
  }
}

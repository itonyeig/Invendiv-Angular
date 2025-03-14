import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CartService } from './cart.service';
import { CartItemI } from './cart.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItemI[] = [];
  discountForm: FormGroup;
  discountError: string = '';
  discountValue: number = 0;
  appliedDiscountCode: string = '';

  constructor(private cartService: CartService, private fb: FormBuilder) {
    this.discountForm = this.fb.group({
      discountCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      console.log('cart items', items)
    });
  }

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }

  get total(): number {
    const total = this.subtotal - this.discountValue;
    return total < 0 ? 0 : total;
  }

  applyDiscount(): void {
    // Mark the discount code field as touched to trigger validation if empty
    this.discountForm.get('discountCode')?.markAsTouched();
    if (this.discountForm.invalid) {
      this.discountError = 'Discount code is required';
      return;
    }

    const code = this.discountForm.get('discountCode')?.value.trim().toUpperCase();
    this.discountError = '';
    this.discountValue = 0;
    this.appliedDiscountCode = '';

    if (!code) {
      return;
    }

    if (code === 'SAVE10') {
      this.discountValue = this.subtotal * 0.10;
      this.appliedDiscountCode = code;
    } else if (code === 'SAVE5') {
      this.discountValue = 5;
      this.appliedDiscountCode = code;
    } else {
      this.discountError = 'Invalid discount code';
    }
  }

  updateQuantity(productId: number, newQuantity: string): void {
    const quantity = Number(newQuantity);
    if (isNaN(quantity)) return;
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }
}



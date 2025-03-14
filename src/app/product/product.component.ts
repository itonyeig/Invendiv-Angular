import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, Subject, EMPTY, Observable } from 'rxjs';
import { map, catchError, startWith, debounceTime } from 'rxjs/operators';
import { ProductService } from './product.service';
import { ProductI } from './product.interface';
import { CartService } from '../cart/cart.service';
import { CartItemI } from '../cart/cart.interface';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  filterForm: FormGroup;

  products$!: Observable<ProductI[]>;
  categories$!: Observable<string[]>;
  cartItems$!: Observable<CartItemI[]>;

  private categorySelectedSubject = new Subject<string>();
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  private searchTermSubject = new Subject<string>();
  searchTermAction$ = this.searchTermSubject.asObservable();

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private cartService: CartService,
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.filterForm.get('category')?.valueChanges
      .pipe(startWith(''))
      .subscribe(value => {
        this.categorySelectedSubject.next(value);
      });

    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        startWith('')
      )
      .subscribe(value => {
        this.searchTermSubject.next(value);
      });

    const productsBase$ = this.productService.getProducts();
    this.cartItems$ = this.cartService.cartItems$;

    this.categories$ = productsBase$.pipe(
      map(products => Array.from(new Set(products.map(p => p.category)))),
      catchError(err => {
        console.error(err);
        return EMPTY;
      })
    );

    this.products$ = combineLatest([
      productsBase$,
      this.categorySelectedAction$.pipe(startWith('')),
      this.searchTermAction$.pipe(startWith(''))
    ]).pipe(
      map(([products, selectedCategory, searchTerm]) =>
        products.filter(product => {
          const matchesCategory = selectedCategory
            ? product.category === selectedCategory
            : true;

          const matchesSearch = product.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

          return matchesCategory && matchesSearch;
        })
      ),
      catchError(err => {
        console.error(err);
        return EMPTY;
      })
    );
  }

  getImageUrl(product: ProductI): string {
    return product.image;
  }

  cartButtonClicked(product: ProductI): void {
    this.cartService.addToCart(product, 1);
  }
  isProductInCart(productId: number, cartItems: CartItemI[] | null): boolean {
  if (!cartItems) return false;
  return cartItems.some(item => item.product.id === productId);
}
}

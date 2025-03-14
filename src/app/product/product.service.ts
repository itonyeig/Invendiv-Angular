import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ProductI } from './product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'https://fakestoreapi.com/';
  private productsCache$!: Observable<ProductI[]>;

  constructor(private http: HttpClient) { }



  getProducts(): Observable<ProductI[]> {
  if (!this.productsCache$) {
    this.productsCache$ = this.http.get<ProductI[]>(this.apiUrl + 'products').pipe(
      shareReplay(1) // caches the last emission for future subscribers
    );
  }
  return this.productsCache$;
  }
}

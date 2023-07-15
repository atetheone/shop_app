import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public offers: any[] = [];
  public orders: any[] = [];
  public customer = "";
  public debugString: string = "Hello on sale page";

  constructor(private http: HttpClient,
              private route: ActivatedRoute ) { }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log('Params :\n' + JSON.stringify(params, null, 3));
      if (params['customer']) {
        this.customer = params['customer'];
        this.http.get<any>(environment.baseurl + '/query/orders_' + this.customer)
          .subscribe(
            answer => this.handleOrderList(answer),
            error => this.debugString = JSON.stringify(error, null, 3)
          )
      }
    })
    this.http.get<any>(environment.baseurl + '/query/products').subscribe(
      answer => this.handleQueryResponse(answer),
      error => this.debugString = JSON.stringify(error, null, 3)
    );
    
  }

  handleOrderList(answer: any[]) {
    this.orders = [];
    for (const order of answer) {
      this.orders.push(order)
    }
    this.debugString = `${this.customer}, you have ${this.orders.length} active orders`
  }


  handleQueryResponse(answer: any[]) {
    this.offers = []
    for (const product of answer) {
      if (product.price > 0)
        this.offers.push(product);
    }
    this.debugString = `number of offers ${this.offers.length}`;
  }

}

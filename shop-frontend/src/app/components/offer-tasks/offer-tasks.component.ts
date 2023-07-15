import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-offer-tasks',
  templateUrl: './offer-tasks.component.html',
  styleUrls: ['./offer-tasks.component.scss']
})
export class OfferTasksComponent implements OnInit {

  constructor(private http: HttpClient) { }

  public offers: any[] = [];

  storeTaskString = 'Hello offer tasks';

  ngOnInit(): void {
        
    this.http.get<any>(environment.baseurl + '/query/products').subscribe(
      answer => this.handleQueryResponse(answer),
      error => this.storeTaskString = JSON.stringify(error, null, 3)
    );
    
  }

  handleQueryResponse(answer: any[]) {
    this.offers = []
    for (const elem of answer) {
      console.log(JSON.stringify(elem, null, 3));
      this.offers.push(elem)
    }
    this.storeTaskString = `number of offers ${this.offers.length}`;
    console.log(environment.warehouseUrl)
  }

}

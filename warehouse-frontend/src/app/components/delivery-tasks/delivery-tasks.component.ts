import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-delivery-tasks',
  templateUrl: './delivery-tasks.component.html',
  styleUrls: ['./delivery-tasks.component.scss']
})
export class DeliveryTasksComponent implements OnInit {


  public debugString = "Hello on pick tasks page";
  public deliveries: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any>(environment.baseurl + '/query/pick-tasks').subscribe(
      answer => this.handleQueryResponse(answer),
      error => this.debugString = JSON.stringify(error, null, 3)
    );
  }

  handleQueryResponse(answer: any[]) {
    answer.forEach(pick => {
      if (pick.state == 'shipping') {
        this.deliveries.push(pick);
      }
    })
    this.debugString = JSON.stringify(this.deliveries, null, 3);
    console.log(this.debugString);
  }
}

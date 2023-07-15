import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-pick-tasks',
  templateUrl: './pick-tasks.component.html',
  styleUrls: ['./pick-tasks.component.scss']
})
export class PickTasksComponent implements OnInit {

  public debugString = "Hello on pick tasks page";
  public picks: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any>(environment.baseurl + '/query/pick-tasks').subscribe(
      answer => this.handleQueryResponse(answer),
      error => this.debugString = JSON.stringify(error, null, 3)
    );
  }

  handleQueryResponse(answer: any[]) {
    answer.forEach(pick => {
      if (pick.state != 'shipping') {
        this.picks.push(pick);
      }
    })
    this.debugString = JSON.stringify(this.picks, null, 3);
    console.log(this.debugString);
  }
}

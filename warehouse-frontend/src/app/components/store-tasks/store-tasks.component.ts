
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-store-tasks',
  templateUrl: './store-tasks.component.html',
  styleUrls: ['./store-tasks.component.scss']
})
export class StoreTasksComponent implements OnInit {

  public palettes: any[] = []

  answer: any = {}
  storeTaskString = 'Hello'

  constructor(private http: HttpClient) { }

  async ngOnInit(){
    this.http.get<any>(environment.baseurl + '/query/palettes').subscribe(
      answer => this.handleQueryResponse(answer),
      error => this.storeTaskString = JSON.stringify(error, null, 3)
    );
  }

  handleQueryResponse(answer: any){
    console.log('there is somme data');
    for(const palette of answer.result){
      this.palettes.push(palette);
    }
    this.storeTaskString = `/query/palettes response contains ${this.palettes.length} palettes`;
    console.log(this.storeTaskString);
  }
}

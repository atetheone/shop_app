import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private username: string = "";
  private password: string = "";
  public isAuth: boolean = false;

  public formGroup = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    password: new UntypedFormControl('', [Validators.required])
  });

  constructor(private http: HttpClient) { }


  ngOnInit(): void {
  }

  submitLogin() {
    const log = {
      username: this.formGroup.get('username')?.value,
      password: this.formGroup.get('password')
    }

    this.http.get<any>(environment.baseurl + '/login').subscribe(
      response => this.isAuth = response,
      error => console.log('get error')
    )

  }

}

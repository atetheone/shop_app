import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { ToastService } from '@mean-stream/ngbx';

@Component({
  selector: 'app-edit-pick',
  templateUrl: './edit-pick.component.html',
  styleUrls: ['./edit-pick.component.scss']
})
export class EditPickComponent implements OnInit {

  public taskCode: string = "";
  public location: string = "";
  public debugOut: string = "Hello Edit pick";
  public pick: any = {};
  public validLocations: string[] = [];

  formGroup = new UntypedFormGroup({
    taskCode: new UntypedFormControl('', [Validators.required]),
    location: new UntypedFormControl('', [Validators.required, this.locationValidator()])
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  locationValidator(){
    return (control: AbstractControl): ValidationErrors | null =>{
      const forbidden = this.validLocations.indexOf(control.value) < 0;
      return forbidden ? {forbiddenName: {value: control.value}} : null;
    };
  }

  locationError(control: AbstractControl){
    const forbidden = this.validLocations.indexOf(control.value) < 0;
    return forbidden ? {forbiddenName: {value: control.value}} : null;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log('Params :\n' + JSON.stringify(params, null, 3));
      if (params['code']) {
        
        this.taskCode = params['code'];  
        this.formGroup.get('taskCode')?.setValue(this.taskCode);
     
        this.http.get<any>(environment.baseurl + '/query/pick-task_' + this.taskCode).subscribe(
          answer => {
            console.log(JSON.stringify(answer, null, 3));
            this.pick = answer;
            this.validLocations = this.pick.locations;
            this.debugOut = `Possible locations: ${this.pick.locations}`;
          },
          error => this.debugOut = JSON.stringify(error, null, 3)
        ); 
      }
    })

    
  }


  submitOffer() {
    const params = {
      taskCode: this.taskCode,
      product: this.pick.product,
      location: this.formGroup.get('location')?.value
    };

    this.http.post<any>(environment.baseurl + '/cmd/pickDone', params).subscribe(
      (response) => {
        console.log('resp is: \n' + JSON.stringify(response, null, 3))
        console.log(environment.baseurl)
        this.router.navigate(['/pick-tasks'])
        this.toastService.success('Pick', 'Pick has been submitted successfully !!!')
      },
      error => {
        this.toastService.error('Edit offer', `Problem: ${JSON.stringify(error, null, 3)}`)
      }
    )
  
  }

}

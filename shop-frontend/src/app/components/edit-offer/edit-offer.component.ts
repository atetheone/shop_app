import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@mean-stream/ngbx'; 
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.component.html',
  styleUrls: ['./edit-offer.component.scss']
})
export class EditOfferComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.http.get<any>(environment.baseurl + '/query/products')
      .subscribe(
        answer => this.handleQueryResponse(answer),
        error => this.debugOut = JSON.stringify(error, null, 3)
      );
  }

  validNames: string[] = [];

  handleQueryResponse(answer: any[]) {
    this.validNames = [];
    for (const elem of answer) {
      this.validNames.push(elem.product);
    }
    this.debugOut = `valid names : ${this.validNames}`;
  }

  formGroup = new UntypedFormGroup({
    productName: new UntypedFormControl('', [Validators.required, this.productNameValidator()]),
    productPrice: new UntypedFormControl('', [Validators.required, this.productPriceValidator()]),
  });

  productNameValidator(){
    return (control: AbstractControl): ValidationErrors | null =>{
      const forbidden = this.validNames.indexOf(control.value) < 0;
      return forbidden ? {forbiddenName: {value: control.value}} : null;
    };
  }

  productNameError(control: AbstractControl){
    const forbidden = this.validNames.indexOf(control.value) < 0;
    return forbidden ? {forbiddenName: {value: control.value}} : null;
  }

  productPriceValidator(){
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = control.value < 0;
      return forbidden ? {forbiddenName: {value: control.value}} : null;
    };

  }
  productPriceError(control: AbstractControl) {
    
      const forbidden = control.value < 0;
      return forbidden ? {forbiddenName: {value: control.value}} : null;
  }

  debugOut = 'Hello edit offer';

  submitOffer(){
    this.debugOut = `your input is ${this.formGroup.get('productName')?.value}`;
    const params = {
      product: this.formGroup.get('productName')?.value,
      price: Number(this.formGroup.get('productPrice')?.value)
    };
    this.http.post<any>(environment.baseurl + '/cmd/setPrice', params).subscribe(
      () => {
        this.toastService.success('Edit offer', 'Price has been stored successfully !!!'),
        this.router.navigate(['/offer-tasks'])
      },
      error => this.toastService.error('Edit offer', `Problem: ${JSON.stringify(error, null, 3)}`)   
    )
  }

}


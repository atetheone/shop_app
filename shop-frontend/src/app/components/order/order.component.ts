import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@mean-stream/ngbx';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  public product: string = "no product";
  public debugOut: string = "Hello order";
  formGroup = new UntypedFormGroup({
    order: new UntypedFormControl('', [Validators.required]),
    product: new UntypedFormControl('', [Validators.required]),
    customer: new UntypedFormControl('', [Validators.required]),
    address: new UntypedFormControl('', [Validators.required]),
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.product = params['product'];
      this.formGroup.get('order')?.setValue('o_' + new Date().toISOString());
      this.formGroup.get('product')?.setValue(this.product);
    })
  }

  submitOffer() {
    this.debugOut = `Your name is ${this.formGroup.get('customer')?.value}`;
    const params = {
      order: this.formGroup.get('order')?.value,
      product: this.formGroup.get('product')?.value,
      customer: this.formGroup.get('customer')?.value,
      address: this.formGroup.get('address')?.value, 
    };

    this.http.post<any>(environment.baseurl + '/cmd/placeOrder', params).subscribe(
      () => {
        this.toastService.success('Order', 'Order has been submitted successfully !!!'),
        this.router.navigate(['/home', this.formGroup.get('customer')?.value])
      },
      error => {
        this.toastService.error('Edit offer', `Problem: ${JSON.stringify(error, null, 3)}`)
      }
    )
  
  }

}

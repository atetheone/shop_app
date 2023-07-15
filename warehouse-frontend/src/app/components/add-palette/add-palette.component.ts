import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { ToastService } from '@mean-stream/ngbx';

@Component({
  selector: 'app-add-palette',
  templateUrl: './add-palette.component.html',
  styleUrls: ['./add-palette.component.scss']
})
export class AddPaletteComponent implements OnInit {
  barcode: string = ""
  product: string = ""
  amount: number = 0
  location: string = ""

  constructor(private http: HttpClient,
              private router: Router,
              private toastService: ToastService) { }

  ngOnInit(): void {
  }

  addPalette() {
    const newPalette = {
      barcode: this.barcode,
      product: this.product,
      amount: this.amount,
      location: this.location
    }

    const newCmd = {
      opCode: 'storePalette',
      parameters: newPalette
    }

    this.http.post<any>(environment.baseurl + "/cmd", newCmd).subscribe( 
      response => {
        this.router.navigate(['/store-tasks']);
        console.log(`Post has been sent ${JSON.stringify(response, null, 3)}`);
        this.toastService.success('Palette', 'The palette has been added successfully')
      },
      error => {
        this.toastService.error('Error', 'Adding impossible')
        console.log(JSON.stringify(error, null, 3))
      }
    );



      console.log(JSON.stringify(newCmd, null, 3)); 

  }

  isFilled() {
    if (this.barcode.length === 0 || this.amount === 0 || this.location.length === 0 || this.product.length === 0)
      return false;
    return true;
  }

}

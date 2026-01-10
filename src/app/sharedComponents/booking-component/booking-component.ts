import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-booking-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-component.html',
  styleUrl: './booking-component.css',
})
export class BookingComponent {
  @ViewChild('toastContainer', { read: ElementRef })
  toastContainer!: ElementRef;

  tour: any;
  travelers: number = 1;
  amountPaid: number = 0;
  orderNumber: string = '';
  prices: any = {};
  subtotal: number = 0;
  total: number = 0;
  filecode!: string;
  image!: string;
  bookingCompleted = false;
  bookingDate: Date = new Date();
  travelDate!: Date;
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  successMessage = '';
  userCountry: string = 'US';

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    this.userCountry = await this.detectCountry();
    console.log('User country detected as:', this.userCountry);
    this.generateOrderNumber();

    const navState = this.router.getCurrentNavigation()?.extras.state as {
      tour: any;
      barcode: string;
      image: string;
    };
    console.log(navState);

    if (navState?.tour) {
      this.tour = navState.tour;
      this.filecode = navState.barcode;
      this.image = navState.image;

      localStorage.setItem('tour', JSON.stringify(this.tour));
      localStorage.setItem('filecode', this.filecode);
      localStorage.setItem('image', this.image);
    } else {
      const storedTour = localStorage.getItem('tour');
      const storedFilecode = localStorage.getItem('filecode');
      const storedImage = localStorage.getItem('image');

      if (storedTour && storedFilecode) {
        this.tour = JSON.parse(storedTour);
        this.filecode = storedFilecode;
        this.image = storedImage!;
      } else {
        this.tour = {
          title: 'Unknown Tour',
          price: 0,
          duration: 'N/A',
          tourType: 'N/A',
        };
      }
    }

    const storedPrices = localStorage.getItem('prices');
    console.log('Stored prices:', storedPrices);
    if (storedPrices) {
      this.prices = JSON.parse(storedPrices);
      this.updateAmounts();
    } else if (this.filecode) {
      this.loadTourPrices(this.filecode);
    }
  }

  async detectCountry(): Promise<string> {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      return data.country;
    } catch {
      return 'US';
    }
  }

  loadTourPrices(fileName: string) {
    this.http.get(`/assets/data/${this.userCountry+fileName}.json`).subscribe((data: any) => {
      this.prices = data.price;
      localStorage.setItem('prices', JSON.stringify(this.prices));
      this.updateAmounts();
    });
  }

  generateOrderNumber() {
    let lastOrder = localStorage.getItem('lastOrderNumber');
    let newOrder = 1;

    if (lastOrder) {
      newOrder = parseInt(lastOrder, 10) + 1;
    }

    localStorage.setItem('lastOrderNumber', newOrder.toString());

    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');

    this.orderNumber = `#${datePart}-${newOrder.toString().padStart(6, '0')}`;
  }

  updateTravelers(event: any) {
    const value = parseInt(event.target.value, 10);
    this.travelers = isNaN(value) || value < 1 ? 1 : value;
    this.updateAmounts();
  }

  updateAmounts() {
    if (this.prices && this.prices[this.travelers]) {
      this.subtotal = this.prices[this.travelers];
    } else {
      this.subtotal = 0;
    }
    this.total = this.subtotal;
  }

  get amountDue() {
    return this.total - this.amountPaid;
  }

  completeBooking() {
    const bookingDetails = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      travelers: this.travelers,
      tour: this.tour,
      orderNumber: this.orderNumber,
      total: this.total,
      bookingDate: this.bookingDate,
      travelDate: this.travelDate,
    };

    this.successMessage = 'Processing your booking...';
    this.http
      .post(`${environment.backendUrl}/send-booking-email`, bookingDetails)
      .subscribe({
        next: (res: any) => {
          this.successMessage = 'Your booking has been completed successfully!';
          setTimeout(() => {
            this.bookingCompleted = true;
          }, 2000);
        },
        error: (err) => {
          console.error('Email error:', err);
          this.successMessage = 'There was an error processing your booking. Please try again later.';
        },
      });
  }

  printInvoice() {
    const printContents = document.getElementById('invoiceContent')?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      const printWindow = window.open('', '', 'height=700,width=900');
      printWindow!.document.write(`
      <html>
        <head>
          <title>Booking Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .card {
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              padding: 20px;
              border-radius: 10px;
            }
            .list-group-item {
              border: none;
              border-bottom: 1px solid #eee;
              padding: 10px 0;
            }
            .list-group-item:last-child {
              border-bottom: none;
            }
            .text-center { text-align: center; }
            .fw-bold { font-weight: bold; }
            .text-success { color: green; }
            .text-danger { color: red; }
            .text-primary { color: #007bff; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
      printWindow!.document.close();
      printWindow!.print();
    }
  }

  onTravelDateChange(dateString: string) {
    this.travelDate = new Date(dateString);
  }

  clearLocalStorage() {
    localStorage.removeItem('tour');
    localStorage.removeItem('filecode');
    localStorage.removeItem('prices');
  }

  ngOnDestroy() {
    localStorage.removeItem('tour');
    localStorage.removeItem('filecode');
    localStorage.removeItem('prices');
  }
}

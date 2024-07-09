import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface PlaceSearchResult {
  address: string;
  location?: google.maps.LatLng;
  imageUrl?: string;
  iconUrl?: string;
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

@Component({
  selector: 'app-place-autocomplete',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, FormsModule,],
  template: `
  <div class="grid-container">
  
   <mat-form-field appearance="outline">
        <mat-label>Address 1 </mat-label>
      <input [placeholder]="placeholder" #inputField matInput [(ngModel)]="selectedPlace.address1" />
    </mat-form-field>
    
  <div class="grid-item">
    <mat-form-field appearance="outline">
     <mat-label>Address 2 </mat-label>
      <input matInput placeholder="Address 2" [(ngModel)]="selectedPlace.address2" />
    </mat-form-field>
  </div>
  <div class="grid-item">
    <mat-form-field appearance="outline">
         <mat-label>City </mat-label>
      <input matInput placeholder="City" [(ngModel)]="selectedPlace.city" />  
    </mat-form-field>
  </div>
  <div class="grid-item">
    <mat-form-field appearance="outline">
         <mat-label>State</mat-label>
      <input matInput placeholder="State" [(ngModel)]="selectedPlace.state" />
    </mat-form-field>
  </div>
  <div class="grid-item">
    <mat-form-field appearance="outline">
         <mat-label>Postal/Zip Code</mat-label>
      <input matInput placeholder="Zip" [(ngModel)]="selectedPlace.zip" />
    </mat-form-field>
  </div>
  <div class="grid-item">
    <mat-form-field appearance="outline">
        <mat-label>Country</mat-label>
      <input matInput placeholder="Country" [(ngModel)]="selectedPlace.country" />
    </mat-form-field>
  </div>
</div>

  `,
  styles: [
    `
 .mat-form-field {
  width: 100%;
  margin-top: 8px;
  }

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.grid-item {
  grid-column: span 1;
}
    `,
  ],
})
export class PlaceAutocompleteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputField') inputField!: ElementRef;
  @Input() placeholder = 'Enter address...';
  @Output() placeChanged = new EventEmitter<PlaceSearchResult>();
  @Output() clearFields = new EventEmitter<void>();

  autocomplete: google.maps.places.Autocomplete | undefined;
  selectedPlace: PlaceSearchResult = { address: '' };

  constructor(private ngZone: NgZone) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.autocomplete = new google.maps.places.Autocomplete(this.inputField.nativeElement);
    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = this.autocomplete?.getPlace();
        console.log("Places", place)
        this.selectedPlace = {
          address: this.inputField.nativeElement.value,
          name: place?.name,
          location: place?.geometry?.location,
          imageUrl: this.getPhotoUrl(place),
          iconUrl: place?.icon,
          address1: this.getAddress1(place),
          address2: this.getAddress2(place),
          city: this.getCity(place),
          state: this.getState(place),
          zip: this.getZip(place),
          country: this.getCountry(place)
        };
        this.placeChanged.emit(this.selectedPlace);
      });
    });
  }

  ngOnDestroy() {
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }
  }

  clearInputs() {
    this.selectedPlace = { address: '', address1: '', address2: '', city: '', state: '', zip: '', country: '' };
    this.clearFields.emit();
  }

  private getPhotoUrl(place: google.maps.places.PlaceResult | undefined): string | undefined {
    return place?.photos?.[0]?.getUrl({ maxWidth: 500 });
  }

  private getAddress1(place: google.maps.places.PlaceResult | undefined): string | undefined {
    const streetNumber = place?.address_components?.find(comp => comp.types.includes('street_number'))?.long_name || '';
    const route = place?.address_components?.find(comp => comp.types.includes('route'))?.long_name || '';
    return `${streetNumber} ${route}`.trim();
  }

  private getAddress2(place: google.maps.places.PlaceResult | undefined): string | undefined {
    return place?.address_components?.find(comp => comp.types.includes('sublocality_level_1'))?.long_name;
  }

  private getCity(place: google.maps.places.PlaceResult | undefined): string | undefined {
    return place?.address_components?.find(comp => comp.types.includes('locality'))?.long_name;
  }

  private getState(place: google.maps.places.PlaceResult | undefined): string | undefined {
    return place?.address_components?.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name;
  }

  private getZip(place: google.maps.places.PlaceResult | undefined): string | undefined {
    return place?.address_components?.find(comp => comp.types.includes('postal_code'))?.long_name;
  }

  private getCountry(place: google.maps.places.PlaceResult | undefined): string | undefined {
    return place?.address_components?.find(comp => comp.types.includes('country'))?.long_name;
  }
}


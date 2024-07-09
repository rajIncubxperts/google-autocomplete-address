import { Component, ViewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PlaceAutocompleteComponent, PlaceSearchResult } from './components/place-autocomplete.component';
import { PlaceCardComponent } from './components/place-card.component';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    PlaceAutocompleteComponent,
    PlaceCardComponent,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
  ],
  template: `
    <mat-toolbar color="primary"></mat-toolbar>
    <div class="container">
      <h2>Address Details</h2>
      <div class="input-area">
        <app-place-autocomplete (placeChanged)="fromValue = $event" (clearFields)="clearFromValue()"  placeholder="Address 1"></app-place-autocomplete>
      </div>
          <div class="button-area">
        <button mat-raised-button color="primary" (click)="save()">Save</button>
        <button mat-raised-button color="warn" (click)="clear()">Clear</button>
      </div>
      <div class="display-area" [hidden]="!fromValue.address">
        <div>
          <app-place-card [data]="fromValue"></app-place-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
        .input-area {
        justify-content: center;
        gap: 16px;
        align-items: center;
      }
     .button-area {
        margin-top: 16px;
        display: flex;
        gap: 16px;
        justify-content: center;
      }
      .display-area {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        height: calc(100vh - 180px);

        > div {
          width: 30%;
          overflow: auto;
          padding: 8px;
          height: inherit;

          > * {
            margin-bottom: 16px;
          }
        }

        > app-map-display {
          width: 70%;
          height: inherit;
        }
      }

      .display-area[hidden] {
        display: none;
      }

      .container {
        padding: 24px;
        margin:12px;
        border: 2px grey solid;
      }

      app-place-autocomplete {
        width: 300px;
      }
    `,
  ],
})
export class AppComponent {
  @ViewChild(PlaceAutocompleteComponent) autocompleteComponent!: PlaceAutocompleteComponent;
  fromValue: PlaceSearchResult = { address: '' };

  constructor(private http: HttpClient) { }

  save() {
    const postData = {
      address1: this.fromValue.address1,
      address2: this.fromValue.address2,
      state: this.fromValue.state,
      city: this.fromValue.city,
      zip: this.fromValue.zip,
      country: this.fromValue.country,
    };

    this.http.post('https://jsonplaceholder.typicode.com/posts', postData)
      .subscribe(response => {
        console.log('Saved successfully:', response);
        this.clear();
      }, error => {
        console.error('Error saving:', error);
      });
  }

  clear() {
    this.fromValue = { address: '' };
    this.autocompleteComponent.clearInputs();
  }

  clearFromValue() {
    this.fromValue = { address: '' };
  }
}

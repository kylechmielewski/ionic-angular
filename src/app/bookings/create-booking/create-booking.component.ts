import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  onCancel() {
    this.modalController.dismiss(null, 'cancel', 'place-detail-booking');
  }

  onBookPlace() {
    this.modalController.dismiss(
      { message: 'This is a dummy message!' },
      'confirm'
    );
  }
}

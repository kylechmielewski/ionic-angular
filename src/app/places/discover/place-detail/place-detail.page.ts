import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  RouterLinkDelegate,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingService } from 'src/app/bookings/booking.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private placesService: PlacesService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private bookingServe: BookingService,
    private loadingController: LoadingController,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('placeId')) {
        this.navController.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      this.loadingController
        .create({ message: 'Loading...' })
        .then((loadingEl) => {
          loadingEl.present();
          this.placeSub = this.placesService
            .getPlace(paramMap.get('placeId'))
            .subscribe(
              (place) => {
                this.place = place;
                this.isBookable = place.userId !== this.authService.userId;
                this.isLoading = false;
                loadingEl.dismiss();
              },
              (error) => {
                loadingEl.dismiss();
                this.alertController
                  .create({
                    header: 'An error occurred!',
                    message: 'Could not load place.',
                    buttons: [
                      {
                        text: 'Okay',
                        handler: () => {
                          this.router.navigate(['/places/tabs/discover']);
                        },
                      },
                    ],
                  })
                  .then((alertEl) => alertEl.present());
              }
            );
        });
    });
  }

  onBookPlace() {
    //this.router.navigateByUrl('/places/tabs/discover')
    //this.navController.navigateBack('/places/tabs/discover');

    this.actionSheetController
      .create({
        header: 'Choose an Action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingModal('select');
            },
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookingModal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'destructive', //colors button red
            //role: 'cancel' //at bottom of list
          },
        ],
      })
      .then((actionSheetElement) => {
        actionSheetElement.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalController
      .create({
        component: CreateBookingComponent,
        animated: true,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
        id: 'place-detail-booking',
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((result) => {
        if (result.role === 'confirm') {
          this.loadingController
            .create({ message: 'Booking place...' })
            .then((loadingEl) => {
              loadingEl.present();
              const data = result.data.bookingData;
              this.bookingServe
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                });
            });
        }
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}

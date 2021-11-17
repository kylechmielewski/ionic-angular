import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

// new Place(
//   'p1',
//   'Manhattan Mansion',
//   'In the heart of New York City',
//   'https://img.thedailybeast.com/image/upload/c_crop,d_placeholder_euli9k,h_1440,w_2560,x_0,y_0/dpr_1.5/c_limit,w_1044/fl_lossy,q_auto/v1541016891/181031-carrier-payne-tease_tk805s',
//   150,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// ),
// new Place(
//   'p2',
//   "L'Amour Toujours",
//   'A romantic place in Paris!',
//   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwa6vbTVGCSFhJzu04ehwgCHQkRxM6B9P8ww&usqp=CAU',
//   175,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// ),
// new Place(
//   'p3',
//   'The Foggy Palace',
//   'Not your average city trip! ',
//   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ2tIuw4an3Vux9kvN33Mcg0o3KfPkpoEMZQ&usqp=CAU',
//   100,
//   new Date('2019-01-01'),
//   new Date('2019-12-31'),
//   'abc'
// ),

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    //gives us a subscribable object
    return this._places.asObservable();
  }

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {}

  fetchPlaces() {
    return (
      this.httpClient
        .get<{ [key: string]: PlaceData }>(
          'https://ionic-angular-course-master-default-rtdb.firebaseio.com/offered-places.json'
        )
        //map does not return a new observable
        .pipe(
          map((response) => {
            const places = [];
            for (const key in response) {
              if (response.hasOwnProperty(key)) {
                places.push(
                  new Place(
                    key,
                    response[key].title,
                    response[key].description,
                    response[key].imageUrl,
                    response[key].price,
                    new Date(response[key].availableFrom),
                    new Date(response[key].availableTo),
                    response[key].userId
                  )
                );
              }
            }
            return places;
          }),
          tap((places) => {
            this._places.next(places);
          })
        )
    );
  }

  getPlace(id: string) {
    return this.httpClient
      .get<PlaceData>(
        `https://ionic-angular-course-master-default-rtdb.firebaseio.com/offered-places/${id}.json`
      )
      .pipe(
        map((placeData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId
          );
        })
      );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://img.thedailybeast.com/image/upload/c_crop,d_placeholder_euli9k,h_1440,w_2560,x_0,y_0/dpr_1.5/c_limit,w_1044/fl_lossy,q_auto/v1541016891/181031-carrier-payne-tease_tk805s',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return (
      this.httpClient
        //post = add new object to db
        .post<{ name: string }>(
          'https://ionic-angular-course-master-default-rtdb.firebaseio.com/offered-places.json',
          { ...newPlace, id: null }
        )
        //pipe = get returned observable and perform an action on it
        .pipe(
          //switchMap = take above observable, perform an action and return a new observable
          switchMap((resData) => {
            generatedId = resData.name;
            return this.places;
          }),
          take(1),
          tap((places) => {
            newPlace.id = generatedId;
            this._places.next(places.concat(newPlace));
          })
        )
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          //of = takes a value, wraps it into a new observable and will immediately emit a value
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.httpClient.put(
          `https://ionic-angular-course-master-default-rtdb.firebaseio.com/offered-places/${placeId}.json/`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap((response) => {
        this._places.next(updatedPlaces);
      })
    );
  }
}

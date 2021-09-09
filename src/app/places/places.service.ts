import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places: Place[] = [
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://img.thedailybeast.com/image/upload/c_crop,d_placeholder_euli9k,h_1440,w_2560,x_0,y_0/dpr_1.5/c_limit,w_1044/fl_lossy,q_auto/v1541016891/181031-carrier-payne-tease_tk805s',
      150
    ),
    new Place(
      'p2',
      "L'Amour Toujours",
      'A romantic place in Paris!',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwa6vbTVGCSFhJzu04ehwgCHQkRxM6B9P8ww&usqp=CAU',
      175
    ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip! ',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ2tIuw4an3Vux9kvN33Mcg0o3KfPkpoEMZQ&usqp=CAU',
      100
    ),
  ];

  get places() {
    return [...this._places];
  }

  constructor() {}

  getPlace(id: string) {
    return { ...this._places.find((p) => p.id === id) };
  }
}

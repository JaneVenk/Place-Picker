import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  //places = signal<Place[] | undefined>(undefined);
  private placesServise = inject(PlacesService);
  private destroyRef = inject(DestroyRef);
  isFetching = signal(false);
  error = signal('');
  places = this.placesServise.loadedUserPlaces;


  ngOnInit(): void {
    this.isFetching.set(true);
    const request = this.placesServise.loadUserPlaces().subscribe({
      error: (error: Error) => {
        console.log(error);
        this.error.set(error.message)},
      complete: () => {this.isFetching.set(false);}
    });

    this.destroyRef.onDestroy(() => {
      request.unsubscribe();
    });
  }

  onRemovePlace(place: Place) {
    const request = this.placesServise.removeUserPlace(place).subscribe();

    this.destroyRef.onDestroy(() => {
      request.unsubscribe();
    });
  }
}

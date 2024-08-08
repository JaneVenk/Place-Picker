import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private userPlaces = signal<Place[]>([]);
  private errorService = inject(ErrorService);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', "New Error: Can't get places");
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places', "New Error: Can't get user places").pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces)
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prev = this.userPlaces();
    if (!prev.some(p=> p.id === place.id)) {
      this.userPlaces.update((prevValue) => [...prevValue, place]);
    }
    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id
    }).pipe(
      catchError((error) => {
        this.userPlaces.set(prev);
        this.errorService.showError("New Error: Can't add place");
        return throwError(() => new Error("New Error: Can't add place"))
      })
    )
  }

  removeUserPlace(place: Place) {
    const prev = this.userPlaces();
    if (prev.some((p) => p.id === place.id)) {
      this.userPlaces.set(prev.filter((p) => p.id !== place.id));
    }
    return this.httpClient.delete('http://localhost:3000/user-places/' + place.id)
    .pipe(
      catchError(() => {
        this.userPlaces.set(prev);
        this.errorService.showError("New Error: Can't delete place");
        return throwError(() => new Error("New Error: Can't delete place"))
      })
    );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{places: Place[]}>(url).pipe(
      map((resData) => resData.places),
      catchError((error) => {
        this.errorService.showError(errorMessage);
        return throwError(() => new Error(errorMessage))
      })
    )
  }
}

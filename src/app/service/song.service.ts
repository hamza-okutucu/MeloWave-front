import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Song } from '../model/Song';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiServerBaseUrl = 'http://51.91.100.173:8080';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  public getSongById(id: number): Observable<Song> {
    return this.http.get<Song>(`${this.apiServerBaseUrl}/find/${id}`);
  }

  public createSong(song: Song): Observable<Song> {
    const jwt = this.cookieService.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${jwt}`);

    return this.http.post<Song>(`${this.apiServerBaseUrl}/add`, song, { headers });
  }

  public updateBaAnnouncement(song: Song, id: number): Observable<Song> {
    const jwt = this.cookieService.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${jwt}`);

    return this.http.put<Song>(`${this.apiServerBaseUrl}/update/${id}`, song, { headers });
  }

  public deleteBaAnnouncement(id: number): Observable<void> {
    const jwt = this.cookieService.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${jwt}`);

    return this.http.delete<void>(`${this.apiServerBaseUrl}/delete/${id}`, { headers });
  }

  public getSongsByParameters(
    currentPage: number,
    title?: string,
    artist?: string,
    genre?: string
  ): Observable<Song[]> {
    let httpParams = new HttpParams();

    httpParams = httpParams.set('page', currentPage.toString());
    if(title) httpParams = httpParams.set('title', title);
    if(artist) httpParams = httpParams.set('artist', artist);
    if(genre) httpParams = httpParams.set('genre', genre);
    
    return this.http.get<Song[]>(`${this.apiServerBaseUrl}/search`, { params: httpParams });
  }

  public countSongsByParameters(
    title?: string,
    artist?: string,
    genre?: string
  ): Observable<number> {
    let httpParams = new HttpParams();
  
    if(title) httpParams = httpParams.set('title', title);
    if(artist) httpParams = httpParams.set('artist', artist);
    if(genre) httpParams = httpParams.set('genre', genre);

    return this.http.get<number>(`${this.apiServerBaseUrl}/search/count`, { params: httpParams });
  }

  public downloadSong(songId: number): Observable<HttpResponse<Blob>> {
    const jwt = this.cookieService.get('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${jwt}`);

    return this.http.get(`${this.apiServerBaseUrl}/download/${songId}`, {
      headers,
      observe: 'response',
      responseType: 'blob',
    });
  }

  public getSongArtists(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiServerBaseUrl}/artists`);
  }

  public getSongGenres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiServerBaseUrl}/genres`);
  }
}

import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Song } from '../model/Song';
import { SongService } from '../service/song.service';
import { AuthService } from '../service/auth.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  searchQuery: string;
  selectedArtist: string;
  selectedGenre: string;
  errorMessage: string;
  totalSongs: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  visibleButtons: number;
  pageButtons: number[];
  songs: Song[];
  artists: string[];
  genres: string[];
  loading: boolean;

  private lastSearchQuery: string;
  private lastSelectedArtist: string;
  private lastSelectedGenre: string;
  
  constructor(
    private songService: SongService,
    private elementRef: ElementRef,
    private authService : AuthService
  ) {
    this.searchQuery = '';
    this.selectedArtist = '';
    this.selectedGenre = '';
    this.lastSearchQuery = '';
    this.lastSelectedArtist = '';
    this.lastSelectedGenre = '';
    this.currentPage = 0;
    this.totalSongs = 0;
    this.pageSize = 5;
    this.totalPages = 0;
    this.visibleButtons = 10;
    this.pageButtons = [];
    this.loading = false;
  }

  ngOnInit() {
    this.loadArtists();
    this.loadGenres();
    this.loadSongs();
  }

  loadSongs() {
    this.loading = true;

    this.songService
        .getSongsByParameters(this.currentPage, this.searchQuery, this.selectedArtist, this.selectedGenre)
        .subscribe(
          (songs: Song[]) => this.songs = songs,
          error => this.openModal('fetchSongsErrorModal')
        ).add(() => this.loading = false);

    this.songService
        .countSongsByParameters(this.searchQuery, this.selectedArtist, this.selectedGenre)
        .subscribe(
          (totalSongs: number) => {
            this.totalSongs = totalSongs;
            this.totalPages = Math.ceil(this.totalSongs / this.pageSize);
            this.generatePageButtons();
          },
          error => this.openModal('fetchSongsErrorModal')
        ); 
  }

  search() {
    if (this.searchQuery !== this.lastSearchQuery ||
        this.selectedArtist !== this.lastSelectedArtist ||
        this.selectedGenre !== this.lastSelectedGenre
    ) {
      this.loading = true;

      this.lastSearchQuery = this.searchQuery;
      this.lastSelectedArtist = this.selectedArtist;
      this.lastSelectedGenre = this.selectedGenre;

      this.currentPage = 0;
      
      this.songService
          .getSongsByParameters(this.currentPage, this.searchQuery, this.selectedArtist, this.selectedGenre)
          .subscribe(
            (songs: Song[]) => this.songs = songs,
            error => this.openModal('fetchSongsErrorModal')
          ).add(() => this.loading = false);

      this.songService
          .countSongsByParameters(this.searchQuery, this.selectedArtist, this.selectedGenre)
          .subscribe(
            (totalSongs: number) => {
              this.totalSongs = totalSongs;
              this.totalPages = Math.ceil(this.totalSongs / this.pageSize);
              this.generatePageButtons();
            },
            error => this.openModal('fetchSongsErrorModal')
          );   
    }
  }

  openModal(modalName: string) {
    ($(this.elementRef.nativeElement).find('#' + modalName) as any).modal('show');
  }

  loadArtists() {
    this.songService
        .getSongArtists()
        .subscribe(
          (artists: string[]) => this.artists = artists.sort((a, b) => a.localeCompare(b)),
          error => this.openModal('fetchSongsErrorModal')
        );
  }

  loadGenres() {
    this.songService
        .getSongGenres()
        .subscribe(
          (genres: string[]) => this.genres = genres.sort((a, b) => a.localeCompare(b)),
          error => this.openModal('fetchSongsErrorModal')
        );
  }

  isUserLoggedIn() {
    return this.authService.isAuthenticated();
  }
  
  downloadSong(title: string, id: number) {
    this.songService.downloadSong(id).subscribe((response: HttpResponse<Blob>) => {
      const fileName = `${title}.mp3`

      const blob = response.body as Blob;
      if (blob) {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    });
  }
  generatePageButtons(): void {
    this.pageButtons = [];

    const halfVisibleButtons = Math.floor(this.visibleButtons / 2);
    let startPage = Math.max(0, this.currentPage - halfVisibleButtons);
    let endPage = Math.min(this.totalPages - 1, startPage + this.visibleButtons - 1);

    if (endPage - startPage < this.visibleButtons - 1) {
      startPage = Math.max(0, endPage - this.visibleButtons + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      this.pageButtons.push(page);
    }
  }

  goToPage(page: number): void {
    if(page >= 0 && page < this.totalPages) {
      this.onPageChange(page);
      this.generatePageButtons();
    }
  }
  
  onPageChange(page: number): void {
    this.loading = true;
    this.currentPage = page;

    this.songService
        .getSongsByParameters(this.currentPage, this.searchQuery, this.selectedArtist, this.selectedGenre)
        .subscribe(
          (songs: Song[]) => this.songs = songs,
          error => this.openModal('fetchSongsErrorModal')
        ).add(() => this.loading = false);
  }

  hasNextPage(): boolean {
    return this.currentPage < this.totalPages - 1;
  }
   
  hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }
   
  isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  isLastPage(): boolean {
    return this.currentPage === this.totalPages - 1;
  }
}
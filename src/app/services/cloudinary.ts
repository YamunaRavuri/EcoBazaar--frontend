import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private cloudName = 'dvdtzn4fm';      // <<-- replace if different
  private unsignedPreset = 'Ecobazaar'; // <<-- replace if different

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', this.unsignedPreset);
    return this.http.post(url, fd);
  }
}

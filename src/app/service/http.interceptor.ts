import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class UpgradeInsecureRequestsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request and add the Content-Security-Policy header
    const secureReq = req.clone({
      headers: new HttpHeaders({
        'Content-Security-Policy': 'upgrade-insecure-requests'
      })
    });
    return next.handle(secureReq);
  }
}
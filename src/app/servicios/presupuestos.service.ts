import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import 'rxjs/Rx';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class PresupuestosService {

  presURL = 'https://comprasapp-67a17.firebaseio.com/presupuestos.json';
  preURL = 'https://comprasapp-67a17.firebaseio.com/presupuestos';

  constructor(private http: HttpClient) {

  }
  postPresupuesto(presupuesto: any) {
    const newpres = JSON.stringify(presupuesto);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');


    return this.http.post(this.presURL, newpres, { headers })
      .pipe(
        map((res: Response) => {
          console.log(res);
          return res;
        }))
  }
  getPresupuestos() {
    return this.http.get(this.presURL).pipe(
      map((res: Response) => res)
    )
  }

  getPresupuesto(id$: string) {
    const url = `${this.preURL}/${id$}.json`;
    return this.http.get(url).pipe(
      map((res: Response) => res)
    )
  }


  putPresupuesto(presupuesto: any, id$: string) {
    const newpre = JSON.stringify(presupuesto);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const url = `${this.preURL}/${id$}.json`;
    return this.http.put(url, newpre, { headers }).pipe(
      map((res: Response) =>
        res
      )
    )

  }

  delPresupuesto(id$: string) {
    const url = `${this.preURL}/${id$}.json`;
    return this.http.delete(url)
      .pipe(map(res => res))
  }
}

import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http:HttpClient) { }

  url = environment.backend;
  
  //Users
  login(user:string, pass:string){
    return this.http.post(this.url + '/login', { identificator: user, password: pass });
  }

  getUsers(token: string) {
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/users', { headers });
  }

  getUserById(id: string, token: string) {
    const params = new HttpParams().set('id', id);
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/users/' + { params, headers });
  }

}

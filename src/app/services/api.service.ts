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

  getUsers(id: string, token: string) {
    const params = new HttpParams().set('id', id);
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/users', { params, headers });
  }

  getUserById(id: number, token: string) {
    const params = new HttpParams().set('id', id);
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/user', { params, headers });
  }

  addUser(name: string, username: string, email: string, password: string, role: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.post(this.url + '/users', { name, username, email, password, role }, { headers });
  }

  updateUser(id: string, name: string, username: string, email: string, role: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.put(this.url + '/users', { id, name, username, email, role }, { headers });
  }

  changePassword(id: string, newPass: string, confPass: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.put(this.url + '/change-pass', { id, newPass, confPass }, { headers });
  }

  deleteUser(id: string, token: string) {
    const params = new HttpParams().set('id', id);
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.delete(this.url + '/users/', { params, headers });
  }

  searchUsers(parameter: string, token: string) {
    const params = new HttpParams().set('parameter', parameter);
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/search-users', { params, headers });
  }
  
  //Tickets
  getTickets(token: string) {
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/tickets', { headers });
  }

  getTodaySales(token: string) {
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/today-sales', { headers });
  }

  getTotalSales(token: string) {
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/total-sales', { headers });
  }

  getLast7DaysSales(token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/week-sales', { headers });
  }

  //Visitors
  getTodayVisitors(token: string) {
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/today-visitors', { headers });
  }

  //Prices
  getPrices(token: string) {
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/prices', { headers });
  }

  updatePrices(updates: any[], token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.put(this.url + '/prices', { updates }, { headers });
  }

  //Capacity
  getCapacity(token: string) {
    const headers = new HttpHeaders().set('Authorization', token); 
    return this.http.get(this.url + '/capacity', { headers });
  }

  updateCapacity(id: string, capacity: number, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.put(this.url + '/capacity', { id, capacity }, { headers });
  }
}

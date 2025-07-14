import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  url = environment.backend;

  //Users
  login(user: string, pass: string) {
    return this.http.post(this.url + '/login', { identificator: user, password: pass });
  }

  getUsers(page: number, size: number, token: string) {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
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

  searchUsers(parameter: string, page: number, size: number, token: string) {
    const params = new HttpParams().set('parameter', parameter).set('page', page.toString()).set('size', size.toString());
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/search-users', { params, headers });
  }

  //Tickets
  addTicket(visit_id: string, payment_id: string, discount: string, token: string ){
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.post(this.url + '/tickets', { visit_id, payment_id, discount }, { headers });
  }

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

  getSalesInDateRange(from: string, to: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.post(this.url + '/date-range-sales', { from, to }, { headers });
  }

  getLast7DaysSales(token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/week-sales', { headers });
  }

  updateTicketStatus(id: string, status: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.put(this.url + '/ticket-status', { id, status }, { headers });
  }

  //Visitors
  addVisitor(visit_id: string, price_id: string, gender: string, token: string){
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.post(this.url + '/visitors', {gender, price_id, visit_id}, {headers});
  }
  getTodayVisitors(token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/today-visitors', { headers });
  }

  getDailyVisitors(from: string, to: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.post(this.url + '/date-range-visitors', { from, to }, { headers });
  }

  getVisitorsByPriceTypeTotal(token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/visitors-by-type', { headers });
  }

  getVisitorsByGenderTotal(token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/visitors-by-gender', { headers });
  }

  getActiveVisitorsCount(token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/active-visitors', { headers });
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

  //Settings
  getSettings(token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/settings', { headers });
  }

  updateSettings(id: string, capacity: number, companion_discount: number, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.put(this.url + '/settings', { id, capacity, companion_discount }, { headers });
  }

  //Visits
  addVisit(contact: string, township: string, school: string, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.post(this.url + '/visits', { contact, township, school }, { headers });
  }

  getVisitById(id: any, token: string) {
    const params = new HttpParams().set('id', id);
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.get(this.url + '/visit', { params, headers });
  }

  deleteVisit(id: string, token: string) {
    const params = new HttpParams().set('id', id);
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.delete(this.url + '/visits', { params, headers });
  }

  getVisitsPaginated(page: number, size: number, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<{ data: any[]; total: number; page: number; totalPages: number; }>(this.url + '/visits', { headers, params });
  }

  searchVisitsPaginated(date: string, page: number, size: number, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    const params = new HttpParams().set('date', date).set('page', page.toString()).set('size', size.toString());
    return this.http.get<{ data: any[]; total: number; page: number; totalPages: number; }>(this.url + '/search-visits', { headers, params });
  }

  //Payments
  addPayment(payment_type: string, reference: string, total: number, token: string) {
    const headers = new HttpHeaders().set('Authorization', token);
    return this.http.post(this.url + '/payments', { reference, payment_type, total }, { headers });
  }

}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from "@angular/router";
import { UserService } from "../service/user.service";
import { User } from "../model/user.model";
import { FormControl } from '@angular/forms';
import _ from "lodash";
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.css']
})
export class ListUserComponent implements OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;
  users: Array<any> = [];
  count: string;
  search: string;
  recordsPerPage = 10;
  currentPage = 1;
  pagerSize = 10;

  searchObj = {
    "page": this.currentPage,
    "perPage": 10,
    "term": ''
  }
  private subscriptions: Subscription[] = [];
  constructor(private router: Router, private userService: UserService) { }

  ngOnInit() {
    this.getUsers();
    const searchSubscription = fromEvent(
      this.searchInput.nativeElement,
      'keyup',
    )
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => {
          console.log();
          this.search = this.searchInput.nativeElement.value;
          this.searchObj.term = this.search;
          this.getUsers();
        }),
      )
      .subscribe();
    this.subscriptions.push(searchSubscription);
  }

  getUsers() {
    this.userService.getUsers(this.searchObj)
      .subscribe((data: any) => {
        console.log(data);
        this.users = data.data;
        this.count = data.count;
      });
  }

  deleteUser(user: User): void {
    this.userService.deleteUser(user.id)
      .subscribe(data => {
        this.users = this.users.filter(u => u !== user);
      })
  };

  editUser(user: User): void {
    localStorage.removeItem("editUserId");
    localStorage.setItem("editUserId", user.id.toString());
    this.router.navigate(['edit-user']);
  };

  addUser(): void {
    this.router.navigate(['add-user']);
  };

  onPager(event) {
    console.log(event);
    this.currentPage = event;
    this.searchObj.page = event;
    this.getUsers();
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; import { Observable, of, timer } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Category } from '../models/category';
import { Locker } from '../models/locker';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  GET_ALL_LOCKERS: string = 'http://localhost:8080/api/locker/get-all'
  GET_ALL_LOCKER_CATEGORY: string = 'http://localhost:8080/api/locker/category/get-all'
  isStampRequired: boolean = false;
  istaxable: boolean = false;
  lockerNotFound: boolean = false;
  selectedCompany: any;
  searching: boolean = false;
  searchFailed: boolean = false;
  onLockerSelected: boolean = false;



  constructor(private http: HttpClient, private router: Router, private formBuilder: FormBuilder) { }

  title = 'hubLocker';
  address: string = "22A Adeola Odehu Street, VI, Lagos.";
  distance: string = "0.3";
  totalOpenLockers: number = 0;
  isLoading: boolean = false
  categoryList: Category[] = []
  lockerCategories: any

  localLockerList: Locker[] = [];
  LockerList: Locker[] = [];

  tablePage: number = 1;
  tablePageSize: number = 10;





  onSubmit() {

  }
  ngOnInit(): void {
    this.initForm();
    this.getAllLockers()
    this.getAllLockersCategory()

  }

  searchLockerForm!: FormGroup
  initForm() {
    this.searchLockerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  getAllLockers(): void {

    this.http.get<Locker[]>(this.GET_ALL_LOCKERS).subscribe(
      (respose: Locker[]) => {
        // console.log(respose)
        this.LockerList = respose
        this.localLockerList = this.LockerList;

      },
      error => {
        // console.log(error);

      }
    )
  }

  getAllLockersCategory(): void {

    this.http.get<Locker[]>(this.GET_ALL_LOCKER_CATEGORY).subscribe(
      (respose: Category[]) => {
        // console.log(respose)
        this.categoryList = respose

      },
      error => {
        // console.log(error);

      }
    )
  }


  searchView(event: any): void {
    this.localLockerList = this.transform(this.LockerList, event.target.value);
  }

  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();

    let cons: any[];
    cons = ['field', 'value'];

    return items.filter(obj => {
      for (cons of Object.entries(obj)) {
        let v = cons[1] != null ? <string>cons[1].toString() : '';
        if (v.toLowerCase().indexOf(searchText) > -1) {
          return obj;
        }
      }
    });
  }

  filter(value: any): void {
    let selected: string = value;
    // console.log(value);


    switch (selected) {
      case 'small': {
        console.log("Small selected");
        console.log(this.localLockerList[0].category.name == 'Small');

        this.localLockerList = this.LockerList.filter((x: Locker) => {
          let category = x.category.name.toLowerCase();
          return category == selected ? true : false
        })

        console.log(this.localLockerList);

        break;
      }
      case 'medium': {
        this.localLockerList = this.LockerList.filter((x: Locker) => {
          let category = x.category.name.toLowerCase().trim();
          return category == selected ? true : false
        })
        break;
      }
      case 'large': {
        this.localLockerList = this.LockerList.filter((x: Locker) => {
          let category = x.category.name.toLowerCase().trim();
          return category == selected ? true : false
        })
        break;
      }

      default: {
        this.localLockerList = this.LockerList
      }
    }

  }

  rentNow(): void {
    this.router.navigateByUrl('/rent')

  }






  get selectedLockerSearch(): any {
    this.transform(this.LockerList,this.name)

    return this.onLockerSelected;
  }

  set selectedLockerSearch(data: any) {
    this.persistLockerDetails(data);
  }


  searchLockerByLocation = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        // console.log('------WORKING------');
        this.searching = true;
      }),
      switchMap((term: any) =>
        this.findLockerByLocation(term).pipe(
          tap(() => (this.searchFailed = false)),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searching = false))
    );

  persistLockerDetails(value: any) {

    sessionStorage.setItem('persistLockerDetails', JSON.stringify(value));
    //   console.log(value)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    sessionStorage.removeItem('persistLockerDetails');
  }
name!:string
  formatLockerSearch(item: Locker): string {
    if (!!item && !!item.name) {
      this.name = item.name.trim().toUpperCase();
      if (!!item.name) {
        this.name = item.name.trim();
      }
      return this.name;
    } else return '';
  }

  findLockerByLocation(lockerName: string): Observable<Locker[]> {
    if (lockerName === '') {
      return of([]);
    }
    return of(this.LockerList).pipe(
      map((locker: Locker[]) => {
        if (locker) {
          // console.log(locker);
          // this.persistLockerDetails(locker[0]);
          return this.LockerList.filter((row: Locker) => {
            let locationName: string = row.location.name.toLowerCase();
            // console.log("Location Name: " + locationName);

            // console.log("Actual Location" + row.location.name);


            return locationName.includes(lockerName.toLowerCase()) ? true : false
            // return (row.location.name + '').trim().length > 0;


          });
        } else {
          // console.log("Else Return all Locker");

          return locker;
        }
      }),
      finalize(() => {
        this.lockerNotFound = true;
      })
    );
  }

  itemSelected(event: any): void {
    this.selectedCompany = event.item;
    this.persistLockerDetails(event.item);
    // console.log('the item ' + JSON.stringify(event.item));

  }

}

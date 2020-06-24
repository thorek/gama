import * as _ from 'lodash';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs';
import gql from 'graphql-tag';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  isCollapsed = false;
  private querySubscription: Subscription;

  entities:{name:string, path:string}[]

  constructor( private apollo:Apollo ) {}

  ngOnInit(){
    this.querySubscription = this.apollo.watchQuery<any>({
      query: gql`
        query MetaDataEntityList {
          metaData {
            path
            name
          }
        }
      `})
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.entities = data.metaData;
      });
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}

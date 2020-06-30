import { HttpHeaders } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const uri = 'http://localhost:3000/graphql'; // <-- add the URL of the GraphQL server here

const headers = new HttpHeaders( { Authorization: `admin` } );

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: httpLink => ({
        link: httpLink.create( { uri, headers } ),
        cache: new InMemoryCache()
      }),
      deps: [HttpLink],
    }
  ]
})
export class GraphQLModule {}

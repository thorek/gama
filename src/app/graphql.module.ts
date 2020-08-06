import { HttpHeaders } from '@angular/common/http';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

export type GRAPHGQL_MODULE_CONFIG = {
  uri:string
}

const headers = new HttpHeaders( { Authorization: `admin` } );

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: httpLink => ({
        link: httpLink.create( { uri: GraphQLModule.graphQLModuleConfig.uri, headers } ),
        cache: new InMemoryCache()
      }),
      deps: [HttpLink],
    }
  ]
})
export class GraphQLModule {

  public static graphQLModuleConfig:GRAPHGQL_MODULE_CONFIG;

  public static forRoot(graphQLModuleConfig:GRAPHGQL_MODULE_CONFIG): ModuleWithProviders<GraphQLModule> {
    return {
      ngModule: GraphQLModule,
      providers: (() => {
        GraphQLModule.graphQLModuleConfig = graphQLModuleConfig;
        return [{
          provide: 'graphQLModuleConfig',
          useValue: graphQLModuleConfig
      }]})()
    }
  }
}

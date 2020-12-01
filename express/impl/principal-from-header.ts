import express from 'express';
import { DomainDefinition } from 'graph-on-rails';
import _ from 'lodash';

export const addPrincipalFromHeader = ( domainDefinition:DomainDefinition ) => {
  domainDefinition.contextFn.push( addPrincipalToApolloContext );
}

const addPrincipalToApolloContext = async (expressContext:{req:express.Request}, apolloContext:any) => {
  const token = expressContext.req.headers.authorization;
  const principal = token ? JSON.parse( _.split( token, "'" ).join('"') ) : undefined;
  _.set( apolloContext, 'principal', principal );
}


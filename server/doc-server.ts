import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import _ from 'lodash';

import { SimpleLogin } from './extras/simple-login';
import { DomainConfiguration } from './graph-on-rails/core/domain-configuration';
import { Runtime } from './graph-on-rails/core/runtime';
import { Entity } from './graph-on-rails/entities/entity';

export class DocServer {

  static async create():Promise<ApolloServer> {

    const domainConfiguration = new DomainConfiguration( [`${__dirname}/config-types/doc`] );

    const runtime = await Runtime.create( 'GAMA', {domainConfiguration });
    return runtime.server();
  }
}

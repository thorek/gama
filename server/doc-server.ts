import { ApolloServer } from 'apollo-server-express';

import { DomainDefinition } from './graph-on-rails/core/domain-definition';
import { Runtime } from './graph-on-rails/core/runtime';

export class DocServer {

  static async create():Promise<ApolloServer> {

    const domainConfiguration = new DomainDefinition( [`${__dirname}/config-types/doc`] );

    const runtime = await Runtime.create( {domainDefinition: domainConfiguration });
    return runtime.server();
  }
}

import { DomainDefinition } from 'graph-on-rails/core/domain-definition';
import { printSchema } from 'graphql';

import { Runtime } from '../graph-on-rails/core/runtime';
import { Entity } from '../graph-on-rails/entities/entity';


describe('Schema Generation', () => {

  class ATestEntity extends Entity {
    protected getName() { return 'ATest' }
  }

  class BTestEntity extends Entity {
    protected getName() { return 'BTest' }
    protected getAssocTo() { return [{type: 'ATest'}]}
  }


  it( 'should generate schema from config', async () => {
    const runtime = await Runtime.create( { name: 'test:schema', domainDefinition: new DomainDefinition(['./config-types/d2prom'])});
    const schema = printSchema( await runtime.schema() );
    console.log( schema );
  });

  it( 'should generate schema with custom entity', async () => {
    const runtime = await Runtime.create(  { name: 'test:schema', domainDefinition: {
      entity: [ new ATestEntity(), new BTestEntity() ]
    }

    });
    const schema = printSchema( await runtime.schema() );
    expect( schema ).toContain('type ATest');
    expect( schema ).toContain('type BTest');
    expect( schema ).toContain('aTest: ATest');

    // console.log( schema );
  });

  it('should distinguish required variants', async () => {
    const runtime = await Runtime.create( 'test:schema', {
      domainConfiguration: {
        entity: {
          Alpha: {
            attributes: {
              alwaysRequired: { type: 'string', required: true },
              noRequired: { type: 'string' },
              explicitNoRequired: { type: 'string', required: false },
              createRequired: { type: 'string', required: 'create' },
              updateRequired: { type: 'string', required: 'update' },
              virtualField: { type: 'string', virtual: true }
            }
          }
        }
      }
    });
    const schema = printSchema( await runtime.schema() );
    expect( schema ).toContain('type Alpha');
    // console.log( schema )
  })

})

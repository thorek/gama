import { printSchema } from 'graphql';

import { DomainConfiguration, DomainDefinition } from '../graph-on-rails/core/domain-definition';
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

  it('should generate type and enum', async () => {
    const domainDefinition:DomainConfiguration = {
      entity: {
        Car: {
          attributes: {
            licenceNr: 'string',
            fuel: 'Fuel'
          }
        }
      },
      enum: {
        Fuel: ['lead', 'gas', 'diesel']
      }
    };
    const runtime = await Runtime.create( domainDefinition );
    const schema = printSchema( await runtime.schema() );
    // console.log( schema );
    expect(schema).toContain('Car');
    expect(schema).toContain('CarFilter');
    expect(schema).toContain('Fuel');
    expect(schema).toContain('FuelFilter');
  });

  // it( 'should generate schema from config', async () => {
  //   const runtime = await Runtime.create({ name: 'test:schema', domainDefinition: './config-types/cars' });
  //   const schema = printSchema( await runtime.schema() );
  //   console.log( schema );
  //   expect(schema).toContain('Car');
  //   expect(schema).toContain('CarFilter');
  //   expect(schema).toContain('Fuel');
  //   expect(schema).toContain('FuelFilter');
  // });

  // it( 'should generate schema with custom entity', async () => {
  //   const domainDefinition = new DomainDefinition();
  //   domainDefinition.entities.push( new ATestEntity() );
  //   domainDefinition.entities.push( new BTestEntity() );
  //   const runtime = await Runtime.create(  { name: 'test:schema', domainDefinition });
  //   const schema = printSchema( await runtime.schema() );
  //   expect( schema ).toContain('type ATest');
  //   expect( schema ).toContain('type BTest');
  //   expect( schema ).toContain('aTest: ATest');

  //   // console.log( schema );
  // });

  // it('should distinguish required variants', async () => {
  //   const runtime = await Runtime.create({ name: 'test:schema',
  //   domainDefinition: {
  //       entity: {
  //         Alpha: {
  //           attributes: {
  //             alwaysRequired: { type: 'string', required: true },
  //             noRequired: { type: 'string' },
  //             explicitNoRequired: { type: 'string', required: false },
  //             createRequired: { type: 'string', required: 'create' },
  //             updateRequired: { type: 'string', required: 'update' }
  //           }
  //         }
  //       }
  //     }
  //   });
  //   const schema = printSchema( await runtime.schema() );
  //   expect( schema ).toContain('type Alpha');
  //   // console.log( schema )
  // })

})

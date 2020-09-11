import { printSchema } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';
import { Context } from '../graph-on-rails/core/context';
import { DomainConfiguration } from '../graph-on-rails/core/domain-configuration';

describe('Calculated Attributes', () => {

  let runtime!:Runtime;
  let context:Context;

  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {

    const domainConfiguration = new DomainConfiguration({
      entity: {
        Alpha: {
          attributes: {
            name: { type: 'string' },
            some: { type: 'int' },
            calculatedA: { type: 'string!', calculate: () => 'calculatedA' },
            calculatedB: { type: 'int', calculate: async () => 42 }
          },
          seeds: {
            alpha1: { name: 'alpha1' },
            alpha2: { name: 'alpha2' }
          }
        }
      }
    });

    runtime = await Runtime.create( 'test:virtual-attributes', { domainConfiguration });
    await runtime.server();
    await Seeder.create( runtime.context ).seed( true );
    context = runtime.context;
  })

  //
  //
  it('should not include virtual attributes in input & filter type', async ()=> {
    const schema = printSchema( await runtime.schema() );
    expect( schema ).not.toContain('calculatedA: StringFilter');
  });

  //
  //
  it('should resolve a virtual attribute', async () => {
    const alpha = context.entities['Alpha'];
    const alpha1 = _.first( await alpha.findByAttribute( { name: 'alpha1' } ) );

    expect( alpha1?.item ).toMatchObject({ name: 'alpha1' } );
    expect( alpha1?.item.calculatedA ).toEqual( 'calculatedA'  );
    expect( alpha1?.item.calculatedB ).toEqual( 42 );
  })

})

import { printSchema } from 'graphql';
import _ from 'lodash';

import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';
import { Context } from '../graph-on-rails/core/context';

describe('Virtual Attributes', () => {

  let runtime!:Runtime;
  let context:Context;

  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {
    runtime = await Runtime.create( "test:virtual-attributes", {
      domainConfiguration: {
        entity: {
          Alpha: {
            attributes: {
              name: { type: 'string' },
              some: { type: 'int' },
              virtualA: { type: 'string!', virtual: true },
              virtualB: { type: 'int', virtual: true },
              virtualC: { type: 'string', virtual: true }
            },
            seeds: {
              "alpha1": { name: "alpha1" },
              "alpha2": { name: "alpha2" }
            }
          }
        }
      },
      virtualResolver: {
        Alpha: {
          virtualA: () => { return "virtualA" },
          virtualB: async () => { return 42 },
        }
      }
    });
    await runtime.server();
    await Seeder.create( runtime.context ).seed( true );
    context = runtime.context;
  })


  //
  //
  it('should not include virtual attributes in input & filter type', async ()=> {
    const schema = printSchema( await runtime.schema() );
    expect( schema ).not.toContain("virtualA: StringFilter");
  });

  //
  //
  it('should resolve a virtual attribute', async () => {

    const alpha = context.entities['Alpha'];
    const alpha1 = _.first( await alpha.findByAttribute( { name: 'alpha1' } ) );

    expect( alpha1?.item ).toMatchObject({ name: "alpha1" } );
    expect( alpha1?.item.virtualA ).toEqual( "virtualA"  );
    expect( alpha1?.item.virtualB ).toEqual( 42 );
    expect( alpha1?.item.virtualC ).toEqual( "[no resolver for 'Alpha:virtualC' provided]" );
  })

})

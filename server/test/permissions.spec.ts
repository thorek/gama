import { Context } from '../graph-on-rails/core/context';
import { Runtime } from '../graph-on-rails/core/runtime';
import { Seeder } from '../graph-on-rails/core/seeder';

const domainConfiguration = {};


describe('Permissions', () => {

  let runtime!:Runtime;
  let context:Context;

  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {
    runtime = await Runtime.create( "test:seeder", {domainConfiguration});
    await runtime.server();
    await Seeder.create( runtime.context ).seed( true );
    context = runtime.context;
  })

  //
  //
  it('should', async ()=> {
    // const alpha = context.entities['Alpha'];
    // const beta = context.entities['Beta'];

    // const alpha1 = await alpha.findOneByAttribute( {name: 'alpha1'} );
    // const alpha2 = await alpha.findOneByAttribute( {name: 'alpha2'} );
    // const alpha3 = await alpha.findOneByAttribute( {name: 'alpha3'} );
    // const alpha4 = await alpha.findOneByAttribute( {name: 'alpha4'} );
    // const beta1 = await beta.findOneByAttribute( {name: 'beta1'} );
    // const beta2 = await beta.findOneByAttribute( {name: 'beta2'} );

    // expect( alpha1?.item.number ).toEqual( 23 );
    // expect( alpha2?.item.number ).toEqual( 42 );
    // expect( alpha3?.item.number ).toEqual( 0 );
    // expect( alpha4?.item.number ).toBeNull()

    // expect( beta1?.item.af ).toEqual('sin');
    // expect( beta2?.item.af ).toEqual('tan');
  });


})

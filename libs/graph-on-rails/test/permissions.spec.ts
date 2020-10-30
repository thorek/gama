import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';

const domainConfiguration = {};


describe('Permissions', () => {

  let runtime!:Runtime;


  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {
    runtime = await Runtime.create({ name: 'test:seeder', domainDefinition: domainConfiguration });
    await Seeder.create( runtime ).seed( true );
  })

  //
  //
  it('should', async ()=> {
    // const alpha = runtime.entities['Alpha'];
    // const beta = runtime.entities['Beta'];

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

import { ResolverContext } from 'core/resolver-context';
import _ from 'lodash';

import { DomainConfiguration } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';

const domainConfiguration:DomainConfiguration = {
  entity: {
    Fleet: {
      attributes: {
        name: 'Key'
      },
      seeds: {
        fleet1: { name: 'Fleet 1' },
        fleet2: { name: 'Fleet 2' },
        fleet3: { name: 'Fleet 3' }
      }
    },
    Car: {
      attributes: {
        licence: 'Key',
        brand: 'String!',
        color: 'String'
      },
      assocTo: 'Fleet',
      seeds: {
        redBmw: {
          licence: 'redBmw',
          brand: 'BMW',
          color: 'red',
          Fleet: { sample: 'Fleet' }
        },
        blueAudi: {
          licence: 'blueAudi',
          brand: 'Audi',
          color: 'blue',
          Fleet: { sample: 'Fleet' }
        },
        3: {
          licence: { eval: 'faker.phone.phoneNumberFormat()' },
          brand: { sample: ["Mercedes", "BMW", "Porsche", "Audi"] },
          color: { sample: ['red','green', 'blue', 'black', 'white'] },
          Fleet: { sample: 'Fleet' }
        }
      },
      permissions: {
        roleA: true,
        user: ( principal:any ) => ({color: { $in: principal.colors }}),
        userWithBlue: () => ({color: { $eq: 'blue' }}),
        userC: (principal:any, ctx:ResolverContext, runtime:Runtime) =>
          runtime.dataStore.buildExpressionFromFilter( runtime.entity('Car'), { color: { in: principal.colors}} ),
        assistant: {
          r: true,
          d: false
        },
        manager: {
          cru: true
        }
      }
    },
    Accessory: {
      attributes: {
        name: 'Key'
      },
      assocTo: 'Car',
      seeds: {
        aForRedBmw: {
          name: 'aForRedBwm',
          Car: 'redBmw'
        },
        aForBlueAudi: {
          name: 'aForBlueAudi',
          Car: 'aForBlueAudi'
        },
        1: {
          name: { eval: 'faker.commerce.product() + ld.random(10000)' },
          Car: { sample: 'Car' }
        }
      },
      permissions: 'Car'
    },
    Some: {
      attributes: {
        name: 'String'
      },
      seeds: {
        foo: {
          name: 'foo'
        },
        10: {
          name: {
            eval: 'faker.lorem.word'
          }
        }
      }
    }
  }
};


describe('Permissions', () => {

  let runtime!:Runtime;

  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  beforeAll( async () => {
    runtime = await Runtime.create({ name: 'test:permissions', domainDefinition: domainConfiguration });
    const messages = await Seeder.create( runtime ).seed( true );
    console.log( messages );
  }, 20000 );

  it('should allow super user', async ()=> {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    if( ! car ) throw new Error();
    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const superUser = _.defaults( { context: { principal: { roles: true } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( superUser );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await car.entityPermissions.ensureTypeRead( redBmw.id, superUser );
  });

  it('should prohibit looser user', async ()=> {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    if( ! car ) throw new Error();
    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const rolesFalse = _.defaults( { context: { principal: { roles: false } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( rolesFalse );
    expect( resolverCtx.args.filter ).toEqual( { id: null } );
    await expect( car.entityPermissions.ensureTypeRead( redBmw.id, rolesFalse ) ).rejects.toBeTruthy();

    const noRoles = _.defaults( { context: { principal: { roles: false } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( noRoles );
    expect( resolverCtx.args.filter ).toEqual( { id: null } );
    await expect( car.entityPermissions.ensureTypeRead( redBmw.id, noRoles ) ).rejects.toBeTruthy();
  });

  it('should allow everyone if no permissions definition at entity exists', async () =>{
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const some = runtime.entity('Some');
    if( ! some ) throw new Error();
    const foo = await some.findOneByAttribute( {name: 'foo'} );
    if( ! foo ) throw new Error();

    await some.entityPermissions.ensureTypesRead( resolverCtx );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await some.entityPermissions.ensureTypeRead( foo.id, resolverCtx );
  })

  it( 'should set no permssion filter if at least one role allows action', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    if( ! car ) throw new Error();
    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const superUser = _.defaults( { context: { principal: { roles: ['roleA','user'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( superUser );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await car.entityPermissions.ensureTypeRead( redBmw.id, superUser );
  })

  it('should add a filter when the role defined by role and principal', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    if( ! car ) throw new Error();
    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const blueAudi = await car.findOneByAttribute( {licence: 'blueAudi'} );
    if( ! blueAudi ) throw new Error();

    const user = _.defaults( { context: { principal: { roles: 'user', colors: ['red', 'green'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter ).toMatchObject( { expression: { color: { $in: ['red', 'green' ] } } } );

    const userWithAllowedId = _.defaults( { args: { id: redBmw.id } }, user );
    await expect( car.entityPermissions.ensureTypeRead( redBmw.id, userWithAllowedId ) ).resolves.not.toThrowError();

    const userWithUnallowedId = _.defaults( { args: { id: blueAudi.id } }, user );
    await expect( car.entityPermissions.ensureTypeRead( blueAudi.id, userWithUnallowedId ) ).rejects.toBeTruthy();
  })

  it( 'should or-join multiple permission expressions', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    if( ! car ) throw new Error();

    const blueAudi = await car.findOneByAttribute( {licence: 'blueAudi'} );
    if( ! blueAudi ) throw new Error();

    const user = _.defaults( { context: { principal: { roles: ['user','userWithBlue'], colors: ['red', 'green'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter ).toMatchObject(
      { expression: { $or: [{ color: { $in: ['red', 'green' ] } }, { color: { $eq: 'blue'}}]} } );

    const userWithBlueId = _.defaults( { args: { id: blueAudi.id } }, user );
    await expect( car.entityPermissions.ensureTypeRead( blueAudi.id, userWithBlueId ) ).resolves.not.toThrowError();
  })

  it('should be able to use filter syntax', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    if( ! car ) return;

    const user = _.defaults( { context: { principal: { roles: 'userC', colors: ['red', 'green'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter ).toMatchObject( { expression: { color: { $in: ['red', 'green' ] } } } );
  })
})

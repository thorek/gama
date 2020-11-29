import _ from 'lodash';

import { DomainConfiguration } from '../core/domain-configuration';
import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';
import { CRUD } from '../entities/entity-resolver';

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
        greenBmw: {
          licence: 'greenBmw',
          brand: 'BWM',
          color: 'green',
          Fleet: { sample: 'Fleet' }
        },
        blackBmw: {
          licence: 'blackBmw',
          brand: 'BWM',
          color: 'black',
          Fleet: { sample: 'Fleet' }
        },
        blueAudi: {
          licence: 'blueAudi',
          brand: 'Audi',
          color: 'blue',
          Fleet: { sample: 'Fleet' }
        },
        redAudi: {
          licence: 'redAudi',
          brand: 'Audi',
          color: 'red',
          Fleet: { sample: 'Fleet' }
        },
        redPorsche: {
          licence: 'redPorsche',
          brand: 'Porsche',
          color: 'red',
          Fleet: { sample: 'Fleet' }
        },
        blackPorsche: {
          licence: 'blackPorsche',
          brand: 'Porsche',
          color: 'black',
          Fleet: { sample: 'Fleet' }
        }
      },
      permissions: {
        roleA: true,
        user: ( { principal } ) => ({color: { $in: principal.colors }}),
        userWithBlue: () => ({color: { $eq: 'blue' }}),
        userC: ( {principal, runtime} ) =>
          runtime.dataStore.buildExpressionFromFilter( runtime.entity('Car'), { color: { in: principal.colors}} ),
        assistant: ( { action } ) => _.includes( [CRUD.READ], action ),
        manager: ( { principal } ) => ({ id: { $in: principal.carIds } })
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
        bForRedBmw: {
          name: 'bForRedBmw',
          Car: 'redBmw'
        },
        aForBlueAudi: {
          name: 'aForBlueAudi',
          Car: 'aForBlueAudi'
        },
        aForGreenBwm: {
          name: 'aForGreenBwm',
          Car: 'greenBmw'
        },
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

    const foo = await some.findOneByAttribute( {name: 'foo'} );
    if( ! foo ) throw new Error();

    await some.entityPermissions.ensureTypesRead( resolverCtx );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await some.entityPermissions.ensureTypeRead( foo.id, resolverCtx );
  })

  it( 'should set no permssion filter if at least one role allows action', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    const redBmw = await car.findOneByAttribute( {licence: 'redBmw'} );
    if( ! redBmw ) throw new Error();

    const superUser = _.defaults( { context: { principal: { roles: ['roleA','user'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( superUser );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await car.entityPermissions.ensureTypeRead( redBmw.id, superUser );
  })

  it('should add a filter when defined by role and principal', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');

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

    const user = _.defaults( { context: { principal: { roles: 'userC', colors: ['red', 'green'] } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter ).toMatchObject( { expression: { color: { $in: ['red', 'green' ] } } } );
  })

  fit( 'should get permissions from delegate', async () => {
    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const accessory = runtime.entity('Accessory');

    const user = _.defaults( { context: { principal: { roles: ['user'], colors: ['red', 'green'] } } }, _.clone(resolverCtx)  );
    await accessory.entityPermissions.ensureTypesRead( user );
    expect( user.args.filter.expression.carId['$in'] ).toHaveLength( 4 );
    const user2 = _.defaults( { context: { principal: { roles: ['user'], colors: ['red', 'green'] } } }, _.clone(resolverCtx)  );
    const acessories = await accessory.resolver.resolveTypes( user2 );
    expect( acessories ).toHaveLength( 3 );
  })
})

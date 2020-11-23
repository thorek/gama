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
        30: {
          licence: { eval: 'faker.phone.phoneNumberFormat()' },
          brand: { sample: ["Mercedes", "BMW", "Porsche", "Audi"] },
          color: { sample: ['red','green', 'blue', 'black', 'white'] },
          Fleet: { sample: 'Fleet' }
        }
      },
      permissions: {
        roleA: true,
        user: () => _.set( {}, 'color', {$in: ['red','blue']}),
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
        100: {
          name: { eval: 'faker.commerce.product() + ld.random(10000)' },
          Car: { sample: 'Car' }
        }
      },
      permissions: 'Car'
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

  //
  //
  it('should react to super and looser user', async ()=> {

    const resolverCtx:any = { root: {}, args: {}, context: {} };
    const car = runtime.entity('Car');
    if( ! car ) return;
    const superUser = _.defaults( { context: { principal: { roles: true } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( superUser );
    expect( resolverCtx.args.filter ).toBeUndefined();
    await car.entityPermissions.ensureTypeRead( superUser );
    expect( resolverCtx.args.filter ).toBeUndefined();

    const rolesFalse = _.defaults( { context: { principal: { roles: false } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( rolesFalse );
    expect( resolverCtx.args.filter ).toEqual( { id: null } );
    await expect( car.entityPermissions.ensureTypeRead( rolesFalse ) ).rejects.toBeTruthy();

    const noRoles = _.defaults( { context: { principal: { roles: false } } }, resolverCtx  );
    await car.entityPermissions.ensureTypesRead( noRoles );
    expect( resolverCtx.args.filter ).toEqual( { id: null } );
    await expect( car.entityPermissions.ensureTypeRead( noRoles ) ).rejects.toBeTruthy();
  });

})

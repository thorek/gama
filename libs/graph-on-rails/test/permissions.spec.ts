import { DomainConfiguration, PrincipalType } from 'core/domain-configuration';
import { ResolverContext } from 'core/resolver-context';
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
        fleet3: { name: 'Fleet 3' },
        fleet4: { name: 'Fleet 4' },
        fleet5: { name: 'Fleet 5' }
      }
    },
    Car: {
      attributes: {
        licence: 'Key',
        brand: 'String!'
      },
      assocTo: 'Fleet',
      seeds: {
        50: {
          licence: { eval: 'faker.phone.phoneNumberFormat()' },
          brand: { sample: ["Mercedes", "BMW", "Porsche", "Audi"] },
          Fleet: { sample: 'Fleet' }
        }
      },
      permissions: {
        user: true,
        roleA: ['222', '3333'],
        assistant: {
          r: true,
          d: false,
          uc: () => {
            return ["9", "8", "4"];
          }
        },
        manager: {
          cru: true,
          d: false
        }
      }
    },
    Accessory: {
      attributes: {
        name: 'Key'
      },
      assocTo: 'Car',
      seeds: {
        300: {
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
  it('should', ()=> {
    expect( 1 ).toBeTruthy();
  });


})

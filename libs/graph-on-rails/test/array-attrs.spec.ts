import { DomainConfiguration } from 'core/domain-configuration';
import { printSchema } from 'graphql';
import { Runtime } from '../core/runtime';
import { Seeder } from '../core/seeder';

const domainConfiguration:DomainConfiguration = {
  entity: {
    User: {
      attributes: {
        username: 'string!',
        roles: '[string]'
      },
      seeds: {
        admin: {
          username: 'admin',
          roles: ['user', 'admin']
        },
        regular: {
          username: 'regular',
          roles: ['user']
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
    await Seeder.create( runtime ).seed( true );
    console.log( printSchema( runtime.schema ) );
  })

  //
  //
  it('should', async ()=> {
    const user = runtime.entities['User'];
    const admin = await user.findOneByAttribute( {username: 'admin'} );
    console.log( admin?.item.roles );
    expect( admin?.item.roles ).toHaveLength( 2 );
    expect( admin?.item.roles ).toEqual(['user', 'admin']);
  });


})

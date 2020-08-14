import _ from 'lodash';
import bcrypt from 'bcryptjs';
import { Context } from 'graph-on-rails/core/context';
import { GraphQLString, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import { DomainConfigurationType } from '../graph-on-rails/core/context';
//
//
export class LoginMutation {


  static getConfiguration():DomainConfigurationType{
    return {
      entity: {
        User: {
          attributes: {
            login: { type: 'string!' },
            password: { type: 'string!' },
          },
          seeds: {
            admin: {
              login: 'admin',
              password: this.password('admin')
            },
            user1: {
              login: 'user1',
              password: this.password('user1')
            },
            user2: {
              login: 'user2',
              password: this.password('user2')
            },
            user3: {
              login: 'user3',
              password: this.password('user3')
            }
          },
          extendFn: ( context:Context ) => {
            context.graphx.type('mutation').extendFields( () => {
              return _.set({}, 'login', {
                type: GraphQLNonNull( GraphQLBoolean ),
                args: {
                  login: { type: GraphQLNonNull( GraphQLString ) },
                  password: { type: GraphQLNonNull( GraphQLString ) }
                },
                resolve: ( root:any, args:any, context:any ) => this.login( context.context, args.login, args.password )
              });
            });
          }
        }
      }
    }
  }

  private static async login( context:Context, login:string, password:string ):Promise<boolean> {
    const entity = context.entities['User'];
    if( ! entity ) return context.warn( `no 'User' type found`, false );
    const user = await entity.findOneByAttribute( { login } );
    if( ! user ) return false;
    return bcrypt.compare( password, user.item.password );
  }

  private static password( password:string ):string {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync( password, salt);
    return hash;
  }
}

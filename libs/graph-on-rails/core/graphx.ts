import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import _ from 'lodash';

import { Runtime } from './runtime';
import { Seeder } from './seeder';

export const scalarTypes:{[scalar:string]:GraphQLScalarType} = {
  ID: GraphQLID,
  String: GraphQLString,
  Int: GraphQLInt,
  Float: GraphQLFloat,
  Boolean: GraphQLBoolean
}


//
//
export class GraphX {

  rawTypes:any = {};

  private fnFromArray = (fns:any) => () => fns.reduce((obj:any, fn:any) => Object.assign({}, obj, fn.call()), {});

  //
  //
  init( runtime:Runtime ){
    this.createQueryType();
    this.createMutationType( runtime );
  }

  /**
   *
   */
  private createMutationType( runtime:Runtime ):void {
    this.createType( 'mutation', {
      name: 'Mutation',
      fields: () => ( {
        ping: {
          type: GraphQLString,
          args: { some: { type: GraphQLString } },
          resolve: ( root:any, args:any ) => `pong, ${args.some}!`
        }
      })
    });
  }

  /**
   *
   */
  private createQueryType():void {
    this.createType( 'query', {
      name: 'Query',
      fields: () => ( {
        ping: { type: GraphQLString, resolve: () => 'pong' }
      } )
    } );
  }

  //
  //
  private createType( name:string, obj:any ){
    if (this.rawTypes[name]) throw new Error(`Type '${name}' already exists.`);
    return this.rawTypes[name] = {
      from: obj.from || GraphQLObjectType,
      name: obj.name,
      description: obj.description,
      args: obj.args,
      fields: [obj.fields],
      values: obj.values,
      types: obj.types,
      interfaceTypes: obj.interfaceTypes,
      parseValue: obj.parseValue,
      parseLiteral: obj.parseLiteral,
      serialize: obj.serialize,
      extendFields: (fields:any) => this.rawTypes[name].fields.push(fields instanceof Function ? fields : () => fields)
    };
  }

  //
  //
  type( name:string, obj?:any ) {
    if( ! name ) throw new Error(`cannot resolve type for non-string`);
    const scalar = this.resolveScalar( name );
    if( scalar ) return scalar;
    if (obj === undefined) {
      if (this.rawTypes[name] === undefined) throw new Error(`Type '${name}' does not exist in this GraphX.`);
      return this.rawTypes[name];
    }
    return this.createType(name, obj);
  }

  // smells like refactoring
  private resolveScalar( name:string ):any {

    let nonNull = false;
    if( _.endsWith( name, '!') ){
      name = name.slice(0, -1);
      nonNull = true;
    }

    let list = false;
    let listItemNonNull = false;
    if( _.startsWith( name, '[') && _.endsWith( name, ']')){
      name = name.slice(1, -1);
      list = true;
      if( _.endsWith( name, '!') ){
        name = name.slice(0, -1);
        listItemNonNull = true;
      }
    }

    let type:any = scalarTypes[name];
    if( ! type ) type = this.rawTypes[name];
    if( ! type ) return undefined;

    if( list ){
      if( listItemNonNull ) type = new GraphQLNonNull( type );
      type = new GraphQLList( type );
    }

    return nonNull ? new GraphQLNonNull( type ) : type;
  }

  /**
   *
   */
  generate = () => {
    this.generateTypes();
    return new GraphQLSchema({
      query: this.type('query'),
      mutation: this.type('mutation')
    });
  }

  /**
   *
   */
  private generateTypes = () => {
    _.forEach( this.rawTypes, (item, key) => {
      if( item.from === GraphQLUnionType ){
        this.rawTypes[key] = new GraphQLUnionType({
          name: item.name,
          types: _.map( item.types(), type => type ),
          description: item.description
        });
      } else if( item.from === GraphQLInterfaceType ){
        this.rawTypes[key] = new GraphQLInterfaceType({
          name: item.name,
          description: item.description,
          fields: this.fnFromArray(item.fields)
        });
      } else if( item.from === GraphQLObjectType ){
        this.rawTypes[key] = new GraphQLObjectType({
          name: item.name,
          description: item.description,
          fields: this.fnFromArray(item.fields),
          interfaces: item.interfaceTypes ? item.interfaceTypes() : []
        });
      } else if( item.from === GraphQLScalarType ) {
        this.rawTypes[key] = new GraphQLScalarType({
          name: item.name,
          description: item.description,
          serialize: item.serialize,
          parseValue: item.parseValue,
          parseLiteral: item.parseLiteral
        });
      } else if( item.from === GraphQLEnumType ) {
        this.rawTypes[key] = new GraphQLEnumType({
          name: item.name,
          values: item.values,
          description: item.description
        });
      } else {
        this.rawTypes[key] = new item.from({
          name: item.name,
          description: item.description,
          args: item.args,
          fields: this.fnFromArray(item.fields),
          values: item.values
        });
      }
    });
  }

}



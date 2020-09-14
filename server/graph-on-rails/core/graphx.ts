import {
  GraphQLBoolean,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
  GraphQLScalarType,
} from 'graphql';
import _ from 'lodash';

import { Context } from './context';
import { Seeder } from './seeder';


//
//
export class GraphX {


  rawTypes:any = {};

  private fnFromArray = (fns:any) => () => fns.reduce((obj:any, fn:any) => Object.assign({}, obj, fn ? fn.call() : undefined), {});

  //
  //
  init(){
    this.createQueryType();
    this.createMutationType();
    this.createValidationViolationType();
    this.createFileType();
  }

  /**
   *
   */
  private createMutationType():void {
    this.createType( 'mutation', {
      name: 'Mutation',
      fields: () => ( {
        ping: {
          type: GraphQLString,
          args: { some: { type: GraphQLString } },
          resolve: ( root:any, args:any ) => `pong, ${args.some}!`
        },
        seed: {
          type: GraphQLString,
          args: { truncate: { type: GraphQLBoolean } },
          resolve: ( root:any, args:any, context:any ) => Seeder.create(
            context.context as Context ).seed( args.truncate )
        }
      } )
    } );
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

  /**
   *
   */
  private createValidationViolationType():void {
    this.type('ValidationViolation', {
      name: 'ValidationViolation',
      fields: () => ({
        attribute: { type: GraphQLString },
        message: { type: new GraphQLNonNull( GraphQLString ) }
      })
    });
  }

  /**
   *
   */
  private createFileType( ):void {
    this.type('file', {
      name: 'File',
      fields: () => ({
        filename: { type: GraphQLNonNull(GraphQLString) },
        mimetype: { type: GraphQLNonNull(GraphQLString) },
        encoding: { type: GraphQLNonNull(GraphQLString) }
      })
    });
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
      extendFields: (fields:any) => this.rawTypes[name].fields.push(fields instanceof Function ? fields : () => fields),
    };
  }

  //
  //
  type( name:string, obj?:any ){
    if (obj === undefined) {
      if (this.rawTypes[name] === undefined) throw new Error(`Type '${name}' does not exist in this GraphX.`);
      return this.rawTypes[name];
    }
    return this.createType(name, obj);
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


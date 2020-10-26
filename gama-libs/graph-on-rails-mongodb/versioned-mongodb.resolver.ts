// import { EntityBuilder } from '../graph-on-rails/builder/entity-builder';
// import { Resolver } from '../graph-on-rails/core/resolver';
// import _ from 'lodash';
// import { FilterQuery, ObjectId } from 'mongodb';

// import { MongoDbResolver } from './mongodb.resolver';

// /**
//  *
//  */
// export class VersionedMongoDbResolver extends MongoDbResolver {


//   /**
//    *
//    */
//   public static async create( config:{url:string, dbName:string} ):Promise<Resolver> {
//     const db = await MongoDbResolver.getDb(config);
//     return new VersionedMongoDbResolver( db );
//   }

//   /**
//    *
//    */
//   extendType( entityType:EntityBuilder ):void {
//     // const objectType = entityType.graphx.type(entityType.typeName());
// 		// objectType.extend( () => (
//     //   { versions: {
//     //       type: new GraphQLList(  ),
//     //       resolve: (root:any, args:any ) => null //([{foo: 0, bar: "Eins"},{foo: 1, bar: "Zwei"},{foo: 2, bar: "Drei"}])
//     //     }
// 		//   }));
//   }



//   /**
//    *
//    */
//   async resolveRefTypes( entityType:EntityBuilder, refType:EntityBuilder, root:any, args:any ):Promise<any[]> {
//     const collection = this.getCollection( refType );
//     const filter = _.set( {}, [`${entityType.singular()}Id`], _.toString( root.id ) );
// 		const entities = await collection.find( filter ).toArray();
// 		return _.map( entities, entity => this.buildOutItem( entity ) );
//   }

//   /**
//    *
//    */
// 	protected getFilterQuery( entityType:EntityBuilder, root:any, args:any ):FilterQuery<any> {
// 		const filter:FilterQuery<any> = {};
// 		_.forEach( _.get( args, 'filter'), (condition, field) => {
// 			const attribute = entityType.getAttribute(field);
// 			if( ! attribute ) return;
// 			const filterType = attribute.getFilterAttributeType();
// 			const expression = filterType ? filterType.getFilterExpression( condition, field ) : null;
// 			if( expression ) filter[`attrs.${field}`] = expression;
// 		});
// 		return filter;
// 	}

// 	//
// 	//
// 	protected buildOutItem( entity:any ):any {
//     const outEntity = _.get( entity, 'attrs' );
//     if( _.isNil( outEntity ) ) return;
//     return _.set( outEntity, 'id', entity._id );
// 	}


// 	//
// 	//
// 	protected async updateEntity( entityType:EntityBuilder, attrs: any ):Promise<any> {
// 		const id = new ObjectId( attrs.id );
//     delete attrs.id;
//     const collection = this.getCollection( entityType );
// 		const entity:any = await collection.findOne( id );
// 		if( ! entity ) return null;
// 		_.merge( entity.attrs, attrs );
// 		if( ! entity.versions ) entity.versions = [];
// 		entity.versions.push( {attrs, createdAt: Date.now() } );
// 		const result = await collection.findOneAndReplace( id, entity );
// 		return this.buildOutItem( entity );
// 	}

// 	//
// 	//
// 	protected async createEntity( entityType:EntityBuilder, attrs: any ):Promise<any> {
//     const doc = {attrs, versions: [{ attrs, createdAt: Date.now() }]};
//     const collection = this.getCollection( entityType );
// 		const result = await collection.insertOne(doc);
// 		const entity:any = await collection.findOne( new ObjectId(result.insertedId ) );
// 		return this.buildOutItem( entity );
// 	}

// }

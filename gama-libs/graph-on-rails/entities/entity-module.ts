import { Entity } from './entity';

export abstract class EntityModule  {

  get context() { return this.entity.context }
  get name() { return this.entity.name }

  constructor( protected readonly entity:Entity ) {}

  warn<T>( message:string, type:T):T {
    console.warn( message );
    return type;
  }
}
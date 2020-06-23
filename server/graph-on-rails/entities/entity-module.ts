import { Entity } from './entity';

export abstract class EntityModule  {

  get context() { return this.entity.context }

  constructor( protected readonly entity:Entity ) {}
}

import * as inflection from 'inflection';
import * as _ from 'lodash';
import { EntityConfigType, TitlePurposeType, FieldConfigType } from './admin-config';


export class AdminData { 

  /**
   *
   */
  constructor(
    public readonly config:EntityConfigType,
    private itemData:any|any[],
    public readonly parent?:AdminData
  ){}

  get item() { return _.isArray( this.itemData ) ? undefined : this.itemData }
  get items() { return _.isArray( this.itemData ) ? this.itemData : undefined }
  get path():string { return this.config.path }
  get id():string { return _.get( this.item, 'id' ) }
  get entitiesName() { return _.get(this.config, 'entitesName' ) || inflection.humanize( this.path ) }
  get entityName() { return _.get(this.config, 'entityName' ) || inflection.humanize( inflection.singularize(this.path ) ) }


}

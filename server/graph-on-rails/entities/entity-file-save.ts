import _ from 'lodash';
import fs from 'fs';
import mkdirp from 'mkdirp';
import { EntityModule } from './entity-module';

export type FileAttribute = {
  filename:string
  encoding:string
  mimetype:string
  data:Buffer
}

//
//
export class EntityFileSave extends EntityModule {

  saveFile( id:string, name:string, fileAttribute:FileAttribute ):Promise<void> {
    return new Promise( async (resolve, reject) => {
      const dirname = _.join(['server', 'uploads', this.entity.typeName, id, name ], '/' );
      await mkdirp( dirname );
      fs.writeFile( fileAttribute.filename, fileAttribute.data, (error) => error ? reject( error ) : resolve() );
    });
  }
}

import _ from 'lodash';
import fs from 'fs';
import path from 'path';
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
      const dirname = ['server', 'uploads', this.entity.typeName, id, name ];
      await mkdirp( path.join(...dirname) );
      const filename = path.join( ...dirname, fileAttribute.filename );
      fs.writeFile( filename, fileAttribute.data, (error) => error ? reject( error ) : resolve() );
    });
  }
}

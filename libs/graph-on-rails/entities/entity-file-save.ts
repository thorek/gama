import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { EntityModule } from './entity-module';


export type FileInfo = {
  name:string
  filename:string
  stream:any
}

//
//
export class EntityFileSave extends EntityModule {

  saveFile( id:string, fileAttribute:FileInfo ):Promise<void> {
    return new Promise( async (resolve, reject) => {
      const dirname = [... this.runtime.config.uploadRootDir as string[], this.entity.typeName, _.toString(id), fileAttribute.name ];
      await mkdirp( path.join(...dirname) );
      const filename = path.join( ...dirname, fileAttribute.filename );
      const data = await this.getData( fileAttribute.stream );
      fs.writeFile( filename, data, (error) => error ? reject( error ) : resolve() );
    });
  }

  getData( stream:any ):Promise<Buffer>{
    return new Promise(resolve => {
      const data:any[] = [];
      stream.on('data', (chunk:any) => data.push(chunk) );
      stream.on('end', () => resolve( Buffer.concat(data) ) );
    });
  }
}

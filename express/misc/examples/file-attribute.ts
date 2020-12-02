import { DomainConfiguration } from "graph-on-rails";


export const domainConfiguration:DomainConfiguration = { 
  entity: {
    Car: {
      attributes: {
        brand: 'String',
        picture: 'File'
      }
    }
  }
}

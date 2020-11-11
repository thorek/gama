import { Entity } from 'graph-on-rails';

/**
 *
 */
export class AddressType extends Entity {

  getName() { return 'Address' }

  getAttributes() { return {
      street: { graphqlType: 'String' },
      zip: { graphqlType: 'String' },
      city: { graphqlType: 'String' },
      country: { graphqlType: 'String' }
  }}

  getAssocTo() { return [
    { type: 'Person' }
  ]}

  getParent() { return 'foo' }

  getSeeds() {
    return [
      {street: 'Lindenstraße', zip: '12345', city: 'Berlin', country: 'Germany' },
      {street: 'Meisenweg', zip: '98765', city: 'München', country: 'Germany' }
    ];
  }
}

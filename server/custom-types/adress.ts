import { Entity } from '../graph-on-rails/entities/entity';

/**
 *
 */
export class AddressType extends Entity {

	getName() { return 'Address' }
	getAttributes() { return {
			street: { type: "String" },
			zip: { type: "String" },
			city: { type: "String" },
			country: { type: "String" }
	}}
	getAssocTo() { return [
		{ type: 'Person' }
	]}
  getParent() { return "foo" }
  getSeeds() {
    return [
      {street: "Lindenstraße", zip: "12345", city: "Berlin", country: "Germany" },
      {street: "Meisenweg", zip: "98765", city: "München", country: "Germany" }
    ];
  }
}

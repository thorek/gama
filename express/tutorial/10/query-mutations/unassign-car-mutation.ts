import _ from 'lodash';
import { Runtime, ValidationViolation, GraphQLTypes } from "graph-on-rails";

export const unassignCarMutation = ( rt:Runtime ) => ({
  type: 'AssignCarReturnType',
  args: {
    carId: { type: 'ID!' }
  },
  resolve: (root:any, args:any ) => resolve( rt, args )
});


const resolve = async ( rt:Runtime, args:any ) => {
  let validationViolations:ValidationViolation[] = [];

  const car = await getCar( rt, args.carId, validationViolations );

  if( ! car || ! _.isEmpty( validationViolations ) ) return { validationViolations };

  car.item.driverId = undefined;
  validationViolations = await car.validate();
  if( _.isEmpty( validationViolations ) ) await car.save( true );
  return { car: car.item, validationViolations };
}

const getCar = async (rt:Runtime, id:any, validationViolations:ValidationViolation[] ) => {
  const car = await rt.entity('Car').findOneByAttribute( { id } );
  _.isUndefined( car ) && validationViolations.push(
    { attribute: 'carId', message: `cannot be found` }  );
  return car;
}


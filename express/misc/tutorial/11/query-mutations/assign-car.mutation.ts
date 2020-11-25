import { Runtime, ValidationViolation } from 'graph-on-rails';
import _ from 'lodash';

export const assignCarMutation = ( rt:Runtime ) => ({
  type: returnType( rt ) && 'AssignCarReturnType',
  args: {
    carId: { type: 'ID!' },
    driverId: { type: 'ID!' }
  },
  resolve: (root:any, args:any ) => resolve( rt, args )
});


const returnType = (rt:Runtime) => rt.type('AssignCarReturnType', {
  fields: () => ({
    car: { type: 'Car' },
    validationViolations: { type: '[ValidationViolation]' }
  })
});


const resolve = async ( rt:Runtime, args:any ) => {
  let validationViolations:ValidationViolation[] = [];

  const car = await getCar( rt, args.carId, validationViolations );
  const driver = await getDriver( rt, args.driverId, validationViolations );
  if( ! car || ! driver || ! _.isEmpty( validationViolations ) ) return { validationViolations };

  car.item.driverId = driver.id
  validationViolations = await car.validate();
  if( _.isEmpty( validationViolations ) ) await car.save( true );
  return { car: car.item, validationViolations };
}

const getCar = async (rt:Runtime, id:any, validationViolations:ValidationViolation[] ) => {
  const car = await rt.entity('Car').findOneByAttribute( { id } );
  _.isUndefined( car ) && validationViolations.push(
    { attribute: 'carId', message: `cannot be found` }  );
  _.get( car, 'item.driverId' ) && validationViolations.push(
    { attribute: 'carId', message: `has already a driver assigned` }  );
  return car;
}

const getDriver = async (rt:Runtime, id:any, validationViolations:ValidationViolation[] ) => {
  const driver = await rt.entity('Driver').findOneByAttribute( { id } );
  _.isUndefined( driver ) && validationViolations.push(
    {attribute: 'driverId', message: `cannot be found` }  );
  return driver;
}


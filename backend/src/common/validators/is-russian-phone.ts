import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { isValidRussianPhone } from '../phone.util';

export function IsRussianPhone(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isRussianPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string' || !value.trim()) {
            return false;
          }
          return isValidRussianPhone(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} должен быть в формате +7XXXXXXXXXX, 8XXXXXXXXXX или 10 цифр`;
        },
      },
    });
  };
}

export function IsOptionalRussianPhone(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isOptionalRussianPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null || value === '') {
            return true;
          }
          if (typeof value !== 'string') {
            return false;
          }
          return isValidRussianPhone(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} должен быть в формате +7XXXXXXXXXX, 8XXXXXXXXXX или 10 цифр`;
        },
      },
    });
  };
}

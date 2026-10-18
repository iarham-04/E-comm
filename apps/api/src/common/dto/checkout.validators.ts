import { ValidateBy, ValidationArguments } from 'class-validator';
import { getAddressErrors, normalizePhone } from '@corazon/checkout-data';

export function IsInternationalPhone() {
  return ValidateBy({
    name: 'internationalPhone',
    validator: {
      validate: (value: unknown) => !!normalizePhone(value),
      defaultMessage: () => 'Enter a valid phone number including its international country calling code.',
    },
  });
}

export function IsCountryAddress() {
  return ValidateBy({
    name: 'countryAddress',
    validator: {
      validate: (value: unknown) => Object.keys(getAddressErrors(value)).length === 0,
      defaultMessage: (args: ValidationArguments) => Object.values(getAddressErrors(args.value)).join(' '),
    },
  });
}

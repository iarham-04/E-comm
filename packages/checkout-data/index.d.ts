export interface CountryOption { value: string; label: string }
export interface AddressFieldRule { label: string; visible: boolean; required: boolean }
export interface AddressRules {
  city: AddressFieldRule;
  state: AddressFieldRule;
  district: AddressFieldRule;
  postalCode: AddressFieldRule & { example: string; pattern: string };
}
export interface CheckoutAddress {
  fullName: string;
  street: string;
  street2?: string;
  city?: string;
  state?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  phone: string;
}
export const COUNTRY_OPTIONS: CountryOption[];
export const PHONE_COUNTRY_OPTIONS: CountryOption[];
export function resolveCountryCode(value: unknown): string | null;
export function getAddressRules(code: string | null): AddressRules;
export function normalizePhone(value: unknown, country?: string): string | null;
export function splitInternationalPhone(value: string): { country: string; nationalNumber: string } | null;
export function getAddressErrors(address: unknown): Record<string, string>;

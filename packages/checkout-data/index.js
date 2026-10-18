const countries = require('./countries.json');
const { getCountries, getCountryCallingCode, parsePhoneNumberFromString } = require('libphonenumber-js/max');

const byCode = new Map(countries.map((country) => [country.code, country]));
const phoneCodes = new Set(getCountries());
const COUNTRY_OPTIONS = countries.map(({ code, name }) => ({ value: code, label: name }))
  .sort((a, b) => a.label.localeCompare(b.label, 'en'));
const PHONE_COUNTRY_OPTIONS = [...phoneCodes].map((code) => ({
  value: code,
  label: `${byCode.get(code)?.name || code} (+${getCountryCallingCode(code)})`,
})).sort((a, b) => a.label.localeCompare(b.label, 'en'));

function resolveCountryCode(value) {
  if (typeof value !== 'string') return null;
  const input = value.trim().toUpperCase();
  if (byCode.has(input)) return input;
  return countries.find((country) => country.name.toUpperCase() === input || country.sourceName === input)?.code || null;
}

function getAddressRules(code) {
  const country = byCode.get(code);
  const format = country?.format || '%A%n%C%n%S%n%Z';
  const required = country?.required || '';
  const field = (token, label) => ({ label, visible: format.includes(`%${token}`) || required.includes(token), required: required.includes(token) });
  const regionLabels = { state: 'State', county: 'County', department: 'Department', district: 'District', emirate: 'Emirate', area: 'Area', island: 'Island', oblast: 'Region', parish: 'Parish', prefecture: 'Prefecture', province: 'Province', do_si: 'Province / Metropolitan city' };
  const cityLabels = { city: 'City / Town', district: 'District', post_town: 'Post town', suburb: 'Suburb' };
  const postalLabels = { zip: 'ZIP code', pin: 'PIN code', eircode: 'Eircode', postal: 'Postal code' };
  return {
    city: field('C', cityLabels[country?.cityType] || 'City / Town'),
    state: field('S', regionLabels[country?.regionType] || 'State / Province / Region'),
    district: field('D', 'District / Neighborhood'),
    postalCode: { ...field('Z', postalLabels[country?.postalType] || 'Postal code'), example: country?.postalExample || '', pattern: country?.postalPattern || '' },
  };
}

function parsePhone(value, country) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    return parsePhoneNumberFromString(value.trim(), { defaultCountry: phoneCodes.has(country) ? country : undefined, extract: false });
  } catch { return undefined; }
}

function normalizePhone(value, country) {
  const phone = parsePhone(value, country);
  return phone?.isValid() ? phone.number : null;
}

// International paste/autofill can update the selector without duplicating a prefix.
function splitInternationalPhone(value) {
  if (typeof value !== 'string' || !value.trim().startsWith('+')) return null;
  const phone = parsePhone(value);
  return phone?.country ? { country: phone.country, nationalNumber: phone.nationalNumber } : null;
}

function getAddressErrors(address) {
  if (!address || typeof address !== 'object') return { country: 'Enter a delivery address.' };
  const errors = {};
  const code = resolveCountryCode(address.country ?? 'IN'); // Compatibility with older India-only clients.
  if (!code) errors.country = 'Select a valid delivery country / region.';
  const rules = getAddressRules(code);
  const text = (key) => typeof address[key] === 'string' ? address[key].trim() : '';
  if (!text('fullName')) errors.fullName = 'Enter the recipient’s full name.';
  if (!text('street')) errors.street = 'Enter the street address.';
  for (const key of ['city', 'state', 'district', 'postalCode']) {
    if (rules[key].required && !text(key)) errors[key] = `Enter ${rules[key].label.toLowerCase()}.`;
  }
  if (text('postalCode') && rules.postalCode.visible && rules.postalCode.pattern && !new RegExp(`^(?:${rules.postalCode.pattern})$`, 'i').test(text('postalCode'))) {
    errors.postalCode = `Enter a valid ${rules.postalCode.label.toLowerCase()}${rules.postalCode.example ? ` (for example, ${rules.postalCode.example})` : ''}.`;
  }
  if (!normalizePhone(address.phone)) errors.phone = 'Enter a valid recipient phone number with its country calling code.';
  return errors;
}

module.exports = { COUNTRY_OPTIONS, PHONE_COUNTRY_OPTIONS, resolveCountryCode, getAddressRules, normalizePhone, splitInternationalPhone, getAddressErrors };

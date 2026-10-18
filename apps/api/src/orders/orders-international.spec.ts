import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { getAddressErrors, normalizePhone, splitInternationalPhone } from '@corazon/checkout-data';
import { CreateOrderApiDto } from '../common/dto/api-contract.dto';
import { OrdersService } from './orders.service';

const address = (changes: Record<string, unknown> = {}) => ({
  fullName: 'Alex Example', street: '1 Example Street', street2: 'Apartment 4',
  country: 'US', city: 'Washington', state: 'DC', postalCode: '20001', phone: '+12025550123', ...changes,
});
const input = (shippingAddress = address(), guestPhone?: string) => plainToInstance(CreateOrderApiDto, {
  guestEmail: 'buyer@example.com', guestPhone, paymentMethod: 'RAZORPAY', shippingAddress,
  items: [{ productId: 'p1', quantity: 1 }],
});
const errors = (dto: CreateOrderApiDto) => validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });

describe('International checkout', () => {
  it.each([
    ['IN', '9876543210', '+919876543210'],
    ['US', '(202) 555-0123', '+12025550123'],
    ['GB', '020 7946 0958', '+442079460958'],
    ['AE', '050 123 4567', '+971501234567'],
    ['SG', '6123 4567', '+6561234567'],
  ])('normalizes a national %s number with its selected calling code', (country, national, expected) => {
    expect(normalizePhone(national, country)).toBe(expected);
  });

  it('handles pasted international numbers without duplicating the country code', () => {
    expect(splitInternationalPhone('+44 20 7946 0958')).toEqual({ country: 'GB', nationalNumber: '2079460958' });
    expect(normalizePhone('+44 20 7946 0958', 'IN')).toBe('+442079460958');
  });

  it.each(['123', '+999123456789', '+1 abc 2025550123', 'call +12025550123'])('rejects invalid or embedded phone input: %s', (phone) => {
    expect(normalizePhone(phone)).toBeNull();
    expect(errors(input(address({ phone })))).not.toHaveLength(0);
  });

  it.each([
    ['IN', { city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', phone: '+919876543210' }],
    ['US', {}],
    ['GB', { city: 'London', state: undefined, postalCode: 'SW1A 1AA', phone: '+442079460958' }],
    ['CA', { city: 'Toronto', state: 'ON', postalCode: 'M5V 3L9', phone: '+14165550123' }],
    ['AU', { city: 'Sydney', state: 'NSW', postalCode: '2000', phone: '+61293744000' }],
    ['AE', { city: undefined, state: 'Dubai', postalCode: undefined, phone: '+971501234567' }],
    ['HK', { city: undefined, state: 'Hong Kong Island', postalCode: undefined, phone: '+85251234567' }],
    ['SG', { city: undefined, state: undefined, postalCode: '018956', phone: '+6561234567' }],
    ['IE', { city: 'Dublin', state: undefined, postalCode: 'D02 X285', phone: '+353851234567' }],
    ['JP', { city: 'Tokyo', state: 'Tokyo', postalCode: '100-0001', phone: '+81312345678' }],
  ])('accepts the country-specific address requirements for %s', (country, fields) => {
    expect(errors(input(address({ ...fields, country })))).toEqual([]);
  });

  it.each([
    { country: 'XX' }, { country: '' }, { state: '' }, { postalCode: '' }, { postalCode: 'ABCDE' },
    { country: 'IN', postalCode: '12345' }, { country: 'AE', state: '' },
  ])('rejects invalid destination fields %j at the API boundary', (changes) => {
    expect(errors(input(address(changes)))).not.toHaveLength(0);
  });

  it('rejects missing addresses and invalid contact phones', () => {
    expect(errors(plainToInstance(CreateOrderApiDto, { paymentMethod: 'RAZORPAY', items: [{ productId: 'p1', quantity: 1 }] }))).not.toHaveLength(0);
    expect(errors(input(address(), '123'))).not.toHaveLength(0);
  });

  it('keeps legacy country names and India defaults compatible', () => {
    const legacy = { city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', phone: '+919876543210' };
    expect(errors(input(address({ ...legacy, country: 'India' })))).toEqual([]);
    expect(errors(input(address({ ...legacy, country: undefined })))).toEqual([]);
  });

  it('preserves NZ suburb details when required by the selected country', () => {
    const nz = address({ country: 'NZ', city: 'Wellington', district: 'Te Aro', state: '', postalCode: '6011', phone: '+6445550123' });
    expect(getAddressErrors(nz)).toEqual({});
    expect(getAddressErrors({ ...nz, district: '' })).toHaveProperty('district');
  });

  it('stores complete international delivery details and E.164 contact numbers in a pending order', async () => {
    const prisma = {
      storeSettings: { findUnique: jest.fn().mockResolvedValue(null) },
      product: { findMany: jest.fn().mockResolvedValue([{ id: 'p1', name: 'Almonds', price: 500, stock: 10, variants: [], collections: [] }]) },
      coupon: { findMany: jest.fn().mockResolvedValue([]) },
      order: { create: jest.fn(async ({ data }) => ({ id: 'test-order', ...data })) },
    };
    const service = new OrdersService(prisma as any, {} as any);
    const dto = input(address({ country: 'SG', city: undefined, state: undefined, postalCode: '018956', phone: '+65 6123 4567' }), '+44 20 7946 0958');
    expect(errors(dto)).toEqual([]);
    const quote = await service.quote(dto);
    await service.createPendingRazorpayOrder(dto, quote, 'synthetic-gateway-order');
    expect(prisma.order.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      guestPhone: '+442079460958', paymentStatus: 'PENDING', paymentMethod: 'RAZORPAY',
      addressSnapshot: expect.objectContaining({ country: 'Singapore', countryCode: 'SG', street2: 'Apartment 4', city: '', state: '', phone: '+6561234567' }),
    }) }));
    await expect(service.quote(input(address({ country: 'XX' })))).rejects.toThrow(BadRequestException);
  });
});

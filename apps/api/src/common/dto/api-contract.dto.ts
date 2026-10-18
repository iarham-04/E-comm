import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { normalizePhone } from '@corazon/checkout-data';
import { IsCountryAddress, IsInternationalPhone } from './checkout.validators';

const phoneValue = ({ value }: { value: unknown }) => normalizePhone(value) || value;

export class AddressDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  fullName: string;

  @IsString() @IsNotEmpty() @MaxLength(300)
  street: string;

  @IsOptional() @IsString() @MaxLength(200)
  street2?: string;

  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @IsOptional() @IsString() @MaxLength(100)
  state?: string;

  @IsOptional() @IsString() @MaxLength(100)
  district?: string;

  @IsOptional() @IsString() @MaxLength(20)
  postalCode?: string;

  @IsOptional() @IsString() @MaxLength(60)
  country?: string;

  @Transform(phoneValue)
  @IsString() @IsNotEmpty() @MaxLength(20) @IsInternationalPhone()
  phone: string;
}

export class OrderItemDto {
  @IsString() @IsNotEmpty()
  productId: string;

  @IsOptional() @IsString()
  variantId?: string;

  @IsInt() @Min(1) @Max(100)
  quantity: number;

  /** Ignored — prices always come from the database. Accepted for client compatibility. */
  @IsOptional() @IsNumber()
  price?: number;
}

export class CreateOrderApiDto {
  @IsOptional() @IsEmail() @MaxLength(254)
  guestEmail?: string;

  @Transform(phoneValue)
  @IsOptional() @IsString() @MaxLength(20) @IsInternationalPhone()
  guestPhone?: string;

  @IsCountryAddress() @ValidateNested() @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsIn(['RAZORPAY'])
  paymentMethod: 'RAZORPAY';

  @IsOptional() @IsIn(['STANDARD', 'EXPRESS'])
  deliverySpeed?: 'STANDARD' | 'EXPRESS';

  @IsOptional() @IsString() @MaxLength(50)
  couponCode?: string;

  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50)
  @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class RazorpayVerifyApiDto {
  @IsString() @IsNotEmpty() @MaxLength(100)
  razorpayOrderId: string;

  @IsString() @IsNotEmpty() @MaxLength(100)
  razorpayPaymentId: string;

  @IsString() @IsNotEmpty() @MaxLength(200)
  razorpaySignature: string;
}

export class CreateReviewApiDto {
  @IsInt() @Min(1) @Max(5)
  rating: number;

  @IsOptional() @IsString() @MaxLength(2000)
  comment?: string;
}

export class SubscribeNewsletterApiDto {
  @IsEmail() @MaxLength(254)
  email: string;
}

export class SubmitContactApiDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  name: string;

  @IsEmail() @MaxLength(254)
  email: string;

  @IsOptional() @IsString() @MaxLength(200)
  subject?: string;

  @IsString() @IsNotEmpty() @MaxLength(5000)
  message: string;
}

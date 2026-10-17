import {
  IsString, IsOptional, IsNumber, IsBoolean, IsInt, IsIn, IsDateString,
  Min, MaxLength, Matches, ValidateIf, IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Relative paths or https URLs only — blocks `javascript:` and other schemes in rendered links. */
const SAFE_URL = /^(\/(?!\/)|https:\/\/)/;

/** Used for create and update; required fields on create are checked in AdminService. */
export class CouponDto {
  @IsOptional() @IsString() @MaxLength(50)
  code?: string;

  @IsOptional() @IsIn(['PERCENTAGE', 'FLAT'])
  discountType?: 'PERCENTAGE' | 'FLAT';

  @IsOptional() @Type(() => Number) @IsNumber() @IsPositive()
  discountValue?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  minOrderValue?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  maxUses?: number;

  @IsOptional() @IsString()
  appliesToCollectionId?: string;

  @IsOptional() @IsDateString()
  startsAt?: string;

  @IsOptional() @IsDateString()
  expiresAt?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class BannerDto {
  @IsOptional() @IsString() @Matches(SAFE_URL, { message: 'imageUrl must be https:// or a site path' })
  imageUrl?: string;

  @IsOptional() @IsString() @MaxLength(200)
  headline?: string;

  @IsOptional() @IsString() @MaxLength(500)
  subtext?: string;

  @IsOptional() @ValidateIf((o) => !!o.linkUrl) @IsString()
  @Matches(SAFE_URL, { message: 'linkUrl must be https:// or a site path' })
  linkUrl?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsDateString()
  startsAt?: string;

  @IsOptional() @IsDateString()
  endsAt?: string;
}

export class UpdateEmailTemplateDto {
  @IsOptional() @IsString() @MaxLength(200)
  subject?: string;

  @IsOptional() @IsString() @MaxLength(50000)
  bodyHtml?: string;
}

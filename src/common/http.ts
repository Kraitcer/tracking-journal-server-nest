import { HttpException, HttpStatus } from '@nestjs/common';
import type Joi from 'joi';

export type Body = Record<string, any>;

export function httpError(
  status: HttpStatus,
  message: string | Record<string, unknown>,
): HttpException {
  return new HttpException(message, status);
}

export function joiValidate(schema: Joi.Schema, value: unknown): void {
  const { error } = schema.validate(value);
  if (error) {
    throw httpError(HttpStatus.BAD_REQUEST, error.details[0].message);
  }
}

export function withoutUndefined(body: Body | undefined): Body {
  return Object.fromEntries(
    Object.entries(body ?? {}).filter(([, value]) => value !== undefined),
  );
}

export function toPlain(doc: any): Body {
  return typeof doc?.toObject === 'function' ? doc.toObject() : doc;
}

export function withIdField(doc: any): Body {
  const { _id, ...rest } = toPlain(doc);
  return { id: _id, ...rest };
}

export function modelFromBody(body: Body | undefined): Body {
  const { id, _id, ...rest } = body ?? {};
  return { _id: id ?? _id, ...rest };
}

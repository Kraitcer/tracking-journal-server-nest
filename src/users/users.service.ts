import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { SignJWT } from 'jose';
import { appConfig, getJwtSecret } from '../config.js';
import { type Body, httpError, joiValidate } from '../common/http.js';
import type { AnyModel } from '../database/database.module.js';
import {
  createUserSchema,
  googleLoginSchema,
  loginSchema,
} from './dto/create-user.dto.js';
import { updateUserSchema } from './dto/update-user.dto.js';
import { USER_MODEL } from './schemas/user.schema.js';

const NOT_FOUND = 'Fucking fuck...';

function isBcryptHash(value: unknown): boolean {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

function normalizeName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

@Injectable()
export class UsersService {
  private readonly googleClient = appConfig.googleClientId
    ? new OAuth2Client(appConfig.googleClientId)
    : null;

  constructor(@InjectModel(USER_MODEL) private readonly users: AnyModel) {}

  private generateAuthToken(user: { _id: unknown }): Promise<string> {
    return new SignJWT({ _id: user._id })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(getJwtSecret());
  }

  findAll() {
    return this.users.find().select('-password').sort('name');
  }

  async findOne(id: string) {
    const user = await this.users.findById(id).select('-password');
    if (!user) throw httpError(HttpStatus.NOT_FOUND, NOT_FOUND);
    return user;
  }

  async register(body: Body) {
    joiValidate(createUserSchema, body);
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const user = await new this.users({
        _id: body._id,
        firstName: body.firstName,
        lastName: body.lastName,
        profileName: body.profileName,
        password: hashedPassword,
        email: body.email,
        authProvider: 'local',
      }).save();
      const { id, email, firstName, lastName, profileName, isActive } = user;
      const token = await this.generateAuthToken(user);
      return {
        user: { id, email, firstName, lastName, profileName, isActive },
        token,
      };
    } catch (err) {
      console.error('ПРОВБЛЕМА в : router.post маршруте в модуле USER', err);
      throw httpError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'ПРОВБЛЕМА в : router.post маршруте в модуле USER',
      );
    }
  }

  async update(id: string, body: Body) {
    joiValidate(updateUserSchema, body);
    const user = await this.users
      .findByIdAndUpdate(id, { name: body.name }, { returnDocument: 'after' })
      .select('-password');
    if (!user) throw httpError(HttpStatus.NOT_FOUND, NOT_FOUND);
    return user;
  }

  async remove(id: string) {
    const user = await this.users.findByIdAndDelete(id).select('-password');
    if (!user) throw httpError(HttpStatus.NOT_FOUND, NOT_FOUND);
    return user;
  }

  async login(body: Body) {
    joiValidate(loginSchema, body);

    const user = await this.users.findOne({ email: body.email });
    if (!user) {
      throw httpError(HttpStatus.BAD_REQUEST, 'invalid email or password');
    }

    let validPassword = false;
    if (isBcryptHash(user.password)) {
      validPassword = await bcrypt.compare(body.password, user.password);
    } else {
      // Backward compatibility: old users may still have plaintext passwords.
      validPassword = body.password === user.password;
      if (validPassword) {
        user.password = await bcrypt.hash(body.password, 10);
        await user.save();
      }
    }

    if (!validPassword) {
      throw httpError(HttpStatus.BAD_REQUEST, 'invalid email or password');
    }

    const { _id, email, firstName, lastName, isActive } = user;
    const token = await this.generateAuthToken(user);
    return { user: { id: _id, email, firstName, lastName, isActive }, token };
  }

  async googleLogin(body: Body) {
    joiValidate(googleLoginSchema, body);

    if (!this.googleClient || !appConfig.googleClientId) {
      console.error('GOOGLE login failed: googleClientId is not configured');
      throw httpError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Google login is not configured',
      );
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: body.idToken,
        audience: appConfig.googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return this.unauthorized('Invalid Google token payload');
      }

      const googleId = payload.sub;
      const email = (payload.email || '').toLowerCase();
      if (!googleId || !email || !payload.email_verified) {
        return this.unauthorized('Google account email is not verified');
      }

      let user =
        (await this.users.findOne({ googleId })) ??
        (await this.users.findOne({ email }));

      const firstName = normalizeName(
        payload.given_name || payload.name,
        'Google',
      );
      const lastName = normalizeName(payload.family_name, 'User');

      if (!user) {
        user = new this.users({
          email,
          firstName,
          lastName,
          profileName: normalizeName(payload.name, 'Google User'),
          authProvider: 'google',
          googleId,
        });
      } else {
        user.email = email;
        user.firstName = normalizeName(user.firstName, firstName);
        user.lastName = normalizeName(user.lastName, lastName);
        user.authProvider = 'google';
        user.googleId = googleId;
      }

      await user.save();

      const token = await this.generateAuthToken(user);
      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
        token,
      };
    } catch (err) {
      if (err instanceof UnauthorizedGoogleError) {
        throw httpError(HttpStatus.UNAUTHORIZED, err.message);
      }
      console.error('GOOGLE login error', err);
      throw httpError(HttpStatus.UNAUTHORIZED, 'Invalid Google token');
    }
  }

  private unauthorized(message: string): never {
    throw new UnauthorizedGoogleError(message);
  }
}

class UnauthorizedGoogleError extends Error {}

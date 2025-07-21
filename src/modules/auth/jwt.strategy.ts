import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
    });
  }

  async validate(payload: any) {
    console.log("✅ [JWT STRATEGY] Payload reçu :", payload); // ✅ Debug

    if (!payload) {
      console.error("❌ [JWT STRATEGY] Token invalide !");
      throw new UnauthorizedException();
    }

    return { id: payload.id, email: payload.email, role: payload.role };
  }
}

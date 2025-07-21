import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log("🔍 [JWT AUTH GUARD] Vérification en cours..."); // ✅ Debug
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.error("❌ [JWT AUTH GUARD] Accès refusé !");
      console.error("🔴 Erreur :", err);
      console.error("🔴 Info :", info);

      throw new UnauthorizedException('Accès refusé ! Vous devez être connecté.');
    }

    console.log("✅ [JWT AUTH GUARD] Accès autorisé :", user);
    return user;
  }
}

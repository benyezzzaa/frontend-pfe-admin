import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  // 💾 Tokens temporaires de réinitialisation (stockés en mémoire)
  private resetTokens: Map<string, string> = new Map();

  // ✅ Connexion avec vérification du statut actif
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.usersService.findByEmail(email);

    // ❌ Ne pas révéler si l'utilisateur existe ou non
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // ❌ Vérifie que le compte est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte est désactivé. Veuillez contacter un administrateur.');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user,
    };
  }

  // ✅ Envoi du lien de réinitialisation de mot de passe
  async forgotPassword(email: string) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new BadRequestException('Adresse email invalide');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Aucun utilisateur associé à cet email.');
    }

    const token = uuidv4();
    this.resetTokens.set(token, email);

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h2>Demande de réinitialisation de mot de passe</h2>
        <p>Bonjour ${user.prenom || ''},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>
      `,
    });

    return {
      message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
    };
  }

  // ✅ Réinitialisation avec token
  async resetPassword(token: string, newPassword: string) {
    const email = this.resetTokens.get(token);

    if (!email) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(email, hashedPassword);

    this.resetTokens.delete(token);

    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }
}

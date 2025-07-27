import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ✅ Géocodage d’adresse avec OpenStreetMap
  private async geocodeAdresse(adresse: string): Promise<{ lat: number; lon: number }> {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: adresse,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'nestjs-backend-app',
      },
    });

    if (res.data.length === 0) {
      throw new Error("Adresse introuvable");
    }

    return {
      lat: parseFloat(res.data[0].lat),
      lon: parseFloat(res.data[0].lon),
    };
  }

  // ✅ Création d’un commercial
  async createCommercial(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email déjà utilisé');
    }

    if (!createUserDto.adresse?.trim()) {
      throw new BadRequestException('Adresse obligatoire pour géolocaliser le commercial.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    let coords;
    try {
      coords = await this.geocodeAdresse(createUserDto.adresse);
    } catch (error) {
      throw new BadRequestException("Adresse invalide ou non trouvée");
    }

    const cleanTel = createUserDto.tel?.replace(/\s+/g, '');

    const commercial = this.userRepository.create({
      ...createUserDto,
      tel: cleanTel,
      password: hashedPassword,
      latitude: coords.lat,
      longitude: coords.lon,
      role: 'commercial',
      isActive: true,
    });

    return await this.userRepository.save(commercial);
  }

  // ✅ Création d’un administrateur
  async createAdmin(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(dto.password, salt);

    const cleanTel = dto.tel?.replace(/\s+/g, '');

    const admin = this.userRepository.create({
      ...dto,
      tel: cleanTel,
      password: hashed,
      role: 'admin',
      isActive: true,
    });

    return this.userRepository.save(admin);
  }

  // ✅ Trouver tous les utilisateurs
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByRole(role?: string) {
    return role
      ? this.userRepository.find({ where: { role } })
      : this.userRepository.find();
  }

  async findAllCommerciaux(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: 'commercial' },
      relations: ['visites'],
    });
  }

  // ✅ Modification par l’admin ou le commercial (admin peut modifier tout)
  async updateUser(id: number, updateUserDto: UpdateUserDto, currentUser?: any) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (currentUser?.role === 'commercial' && currentUser.id !== id) {
      throw new BadRequestException("Vous ne pouvez modifier que votre propre profil.");
    }

    if (currentUser?.role === 'commercial' && updateUserDto.role && updateUserDto.role !== user.role) {
      throw new BadRequestException("Vous ne pouvez pas modifier votre rôle.");
    }

    if (currentUser?.role === 'commercial') {
      delete updateUserDto.password;
    }

    if (updateUserDto.adresse && updateUserDto.adresse !== user.adresse) {
      try {
        const coords = await this.geocodeAdresse(updateUserDto.adresse);
        user.latitude = coords.lat;
        user.longitude = coords.lon;
      } catch (error) {
        throw new BadRequestException("Adresse invalide ou non trouvée");
      }
    }

    if (updateUserDto.tel) {
      updateUserDto.tel = updateUserDto.tel.replace(/\s+/g, '');
    }

    if (updateUserDto.password && (!currentUser || currentUser.role === 'admin')) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  // ✅ Modifier uniquement le statut (actif/inactif)
  async updateStatus(id: number, isActive: boolean) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async updatePassword(email: string, hashedPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    user.password = hashedPassword;
    return this.userRepository.save(user);
  }

  async updatePosition(id: number, latitude: number, longitude: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);

    user.latitude = latitude;
    user.longitude = longitude;
    return this.userRepository.save(user);
  }

  async getAllCommercialsWithPosition() {
    return this.userRepository.find({
      where: { role: 'commercial', isActive: true },
      select: ['id', 'nom', 'prenom', 'latitude', 'longitude'],
    });
  }

  // ✅ Commercial met à jour son propre profil
 async updateOwnProfile(userId: number, updateUserDto: UpdateProfileDto) {

    console.log('📦 updateUserDto recu :', updateUserDto);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    // 🔒 Empêcher la modification du rôle même si injecté manuellement
    if ((updateUserDto as any).role && (updateUserDto as any).role !== user.role) {
      throw new BadRequestException("Vous ne pouvez pas modifier votre rôle.");
    }

    // Nettoyage numéro de téléphone
    if (updateUserDto.tel) {
      updateUserDto.tel = updateUserDto.tel.replace(/[^\d+]/g, '').replace(/^33/, '0');
    }

    // Hachage si mot de passe fourni
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
}

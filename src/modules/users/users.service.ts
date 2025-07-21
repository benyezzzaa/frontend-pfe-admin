import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ✅ Géocodage OpenStreetMap
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

  // ✅ Créer un commercial avec géocodage
  async createCommercial(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email déjà utilisé');
    }

    if (!createUserDto.adresse || createUserDto.adresse.trim() === '') {
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

    const commercial = this.userRepository.create({
      nom: createUserDto.nom,
      prenom: createUserDto.prenom,
      email: createUserDto.email,
      password: hashedPassword,
      tel: createUserDto.tel,
      adresse: createUserDto.adresse,
      latitude: coords.lat,
      longitude: coords.lon,
      role: 'commercial',
    });

    return await this.userRepository.save(commercial);
  }

  // ✅ Créer un admin
  async createAdmin(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(dto.password, salt);

    const admin = this.userRepository.create({
      ...dto,
      password: hashed,
      role: 'admin',
    });

    return this.userRepository.save(admin);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByRole(role?: string) {
    if (role) {
      return this.userRepository.find({ where: { role } });
    }
    return this.userRepository.find();
  }

  async findAllCommerciaux(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: 'commercial' },
      relations: ['visites'],
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.role === 'commercial' && updateUserDto.role === 'admin') {
      throw new BadRequestException("Un commercial ne peut pas être promu administrateur.");
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

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

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
    if (!user) {
      throw new NotFoundException(`Utilisateur ${id} introuvable`);
    }

    user.latitude = latitude;
    user.longitude = longitude;
    return await this.userRepository.save(user);
  }

  async getAllCommercialsWithPosition() {
    return await this.userRepository.find({
      where: { role: 'commercial', isActive: true },
      select: ['id', 'nom', 'prenom', 'latitude', 'longitude'],
    });
  }
}
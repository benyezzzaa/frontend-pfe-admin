import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Circuit } from './circuit.entity';
import { CircuitService } from './circuit.service';
import { CircuitController } from './circuit.controller';
import { Client } from '../client/client.entity';
import { User } from '../users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Circuit, Client, User])],
  controllers: [CircuitController],
  providers: [CircuitService],
})
export class CircuitModule {}

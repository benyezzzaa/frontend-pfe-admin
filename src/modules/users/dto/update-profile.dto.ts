    // src/modules/user/dto/update-profile.dto.ts
    import { ApiProperty } from '@nestjs/swagger';
    import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

    export class UpdateProfileDto {
    @ApiProperty({ example: 'azerty1234', required: false })
    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
    password?: string;

    @ApiProperty({ example: '0612345678', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^(?:\+33|0)[1-9][0-9]{8}$/, {
        message: 'Numéro invalide (format FR)',
    })
    tel?: string;
    }

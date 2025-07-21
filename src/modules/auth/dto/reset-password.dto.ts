    import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: '8d5fc5a2-d1f2-4f4a-8a8a-abc123' })
  token: string;

  @ApiProperty({ example: 'nouveaumotdepasse123' })
  newPassword: string;
}

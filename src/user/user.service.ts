import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from '@/user/user.repository';
import { UserEntity } from './entities/user.entity';
import { UserPublicProfileDto } from './dto/user-public-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserPublicProfileDto> {
    const user = new UserEntity();
    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.phone = createUserDto.phone;
    // The password will be hashed by the BeforeInsert hook in UserEntity
    user.password = createUserDto.password; 
    user.avatar = createUserDto.avatar;
    user.gender = createUserDto.gender;
    user.birthday = createUserDto.birthday;

    const savedUser = await this.userRepository.save(user);
    return new UserPublicProfileDto(savedUser);
  }

  async findAll(): Promise<UserPublicProfileDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => new UserPublicProfileDto(user));
  }

  async findOne(id: number): Promise<UserPublicProfileDto> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID #${id} not found`);
    }
    return new UserPublicProfileDto(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserPublicProfileDto> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID #${id} not found`);
    }

    // Update fields from DTO
    user.username = updateUserDto.username ?? user.username;
    user.email = updateUserDto.email ?? user.email;
    user.phone = updateUserDto.phone ?? user.phone;
    user.avatar = updateUserDto.avatar ?? user.avatar;
    user.gender = updateUserDto.gender ?? user.gender;
    user.birthday = updateUserDto.birthday ?? user.birthday;

    // Handle password update
    if (updateUserDto.password) {
      // The password will be hashed by the BeforeUpdate hook in UserEntity
      user.password = updateUserDto.password;
    }

    const updatedUser = await this.userRepository.save(user);
    return new UserPublicProfileDto(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID #${id} not found`);
    }
  }

  // Assuming register is a specific version of create
  async register(createUserDto: CreateUserDto): Promise<UserPublicProfileDto> {
    return this.create(createUserDto);
  }
}

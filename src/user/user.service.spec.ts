import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '@/user/user.repository';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPublicProfileDto } from './dto/user-public-profile.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt functions
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

const mockUserRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(), // Assuming UserRepository might have a create method, or TypeORM's save is used for creation
};

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (register)', () => {
    it('should create a new user and return public profile', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        gender: 'male',
        birthday: '2000-01-01',
        avatar: 'avatar.jpg',
      };
      const userEntity = new UserEntity();
      Object.assign(userEntity, createUserDto, { id: 1, createdAt: new Date(), updatedAt: new Date() });
      // Mock UserEntity's setPassword to simulate it being called
      userEntity.setPassword = jest.fn().mockResolvedValue(undefined);
      
      // Simulate that repository.save will set the password (as BeforeInsert hook would)
      mockUserRepository.save.mockImplementation(async (user: UserEntity) => {
        if (!user.password.startsWith('$2b$')) { // Simulate hashing if not already hashed
          user.password = 'hashedPassword'; 
        }
        return { ...user, id: 1, createdAt: new Date(), updatedAt: new Date() };
      });


      const result = await service.create(createUserDto);

      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(UserEntity));
      const savedUserArg = mockUserRepository.save.mock.calls[0][0] as UserEntity;
      
      // Check if properties were assigned correctly before save
      expect(savedUserArg.username).toBe(createUserDto.username);
      expect(savedUserArg.email).toBe(createUserDto.email);
      expect(savedUserArg.phone).toBe(createUserDto.phone);
      // The password assigned to entity should be the plain one, hashing happens in entity hook
      expect(savedUserArg.password).toBe(createUserDto.password); 
      
      // The UserEntity's setPassword should be called by the hook,
      // but we can't directly test the hook in a unit test without more complex setup.
      // Instead, we check that the password returned by save is hashed.
      const savedUserResult = await mockUserRepository.save.mock.results[0].value;
      expect(savedUserResult.password).toBe('hashedPassword');

      expect(result).toBeInstanceOf(UserPublicProfileDto);
      expect(result.username).toBe(createUserDto.username);
      expect(result.id).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of user public profiles', async () => {
      const users = [
        { id: 1, username: 'user1', email: 'u1@e.com', password: 'hp1', phone: '1', gender: 'm', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, username: 'user2', email: 'u2@e.com', password: 'hp2', phone: '2', gender: 'f', createdAt: new Date(), updatedAt: new Date() },
      ] as UserEntity[];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserPublicProfileDto);
      expect(result[0].username).toBe('user1');
      expect(result[0].password).toBeUndefined(); // Ensure password is not in public profile
    });
  });

  describe('findOne', () => {
    it('should return a user public profile if found', async () => {
      const user = { id: 1, username: 'user1', email: 'u1@e.com', password: 'hp1', phone: '1', gender: 'm', createdAt: new Date(), updatedAt: new Date() } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(UserPublicProfileDto);
      expect(result.username).toBe('user1');
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user and return public profile', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updateduser', password: 'newPassword123' };
      const existingUser = new UserEntity();
      Object.assign(existingUser, { 
        id: 1, 
        username: 'olduser', 
        email: 'old@e.com', 
        password: 'hashedOldPassword', 
        phone: '1', 
        gender: 'm',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      
      // Simulate that repository.save will set the password (as BeforeUpdate hook would)
      mockUserRepository.save.mockImplementation(async (user: UserEntity) => {
         // If password was provided and isn't a hash, simulate hashing
        if (user.password && !user.password.startsWith('$2b$')) {
          user.password = 'hashedNewPassword';
        }
        return user; // Return the user passed to save, which should be the updated one
      });

      const result = await service.update(1, updateUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(UserEntity));
      
      const savedUserArg = mockUserRepository.save.mock.calls[0][0] as UserEntity;
      expect(savedUserArg.username).toBe(updateUserDto.username);
      // Password given to save should be the plain one from DTO
      expect(savedUserArg.password).toBe(updateUserDto.password); 

      // The UserEntity's setPassword should be called by the hook.
      // We check that the password returned by save is the new hashed one.
      const savedUserResult = await mockUserRepository.save.mock.results[0].value;
      expect(savedUserResult.password).toBe('hashedNewPassword');


      expect(result).toBeInstanceOf(UserPublicProfileDto);
      expect(result.username).toBe(updateUserDto.username);
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException if user to update not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.update(1, { username: 'test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user to remove not found', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

   describe('register', () => {
    it('should call create method with dto and return its result', async () => {
      const createUserDto: CreateUserDto = {
        username: 'reguser', email: 'reg@example.com', password: 'password123', phone: '123', gender: 'f'
      };
      const publicProfile = new UserPublicProfileDto({id:1, username: 'reguser', avatar: '', createdAt: new Date(), updatedAt: new Date()} as UserEntity);
      
      const createSpy = jest.spyOn(service, 'create').mockResolvedValue(publicProfile);

      const result = await service.register(createUserDto);

      expect(createSpy).toHaveBeenCalledWith(createUserDto);
      expect(result).toBe(publicProfile);
    });
  });
});

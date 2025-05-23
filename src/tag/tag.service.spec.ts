import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagEntity } from './entities/tag.entity';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockTagRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

describe('TagService', () => {
  let service: TagService;
  let repository: Repository<TagEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getRepositoryToken(TagEntity),
          useFactory: mockTagRepository,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    repository = module.get<Repository<TagEntity>>(getRepositoryToken(TagEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a tag', async () => {
      const createTagDto: CreateTagDto = { name: 'Test Tag' };
      const tagEntity = { id: 1, tag: 'Test Tag', articles: [] } as TagEntity;

      (repository.findOne as jest.Mock).mockResolvedValue(null);
      (repository.create as jest.Mock).mockReturnValue(tagEntity);
      (repository.save as jest.Mock).mockResolvedValue(tagEntity);

      const result = await service.create(createTagDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { tag: createTagDto.name } });
      expect(repository.create).toHaveBeenCalledWith({ tag: createTagDto.name });
      expect(repository.save).toHaveBeenCalledWith(tagEntity);
      expect(result).toEqual(tagEntity);
    });

    it('should throw ConflictException if tag already exists', async () => {
      const createTagDto: CreateTagDto = { name: 'Test Tag' };
      const existingTag = { id: 1, tag: 'Test Tag' } as TagEntity;
      (repository.findOne as jest.Mock).mockResolvedValue(existingTag);

      await expect(service.create(createTagDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const tags = [{ id: 1, tag: 'Tag1' }, { id: 2, tag: 'Tag2' }] as TagEntity[];
      (repository.find as jest.Mock).mockResolvedValue(tags);

      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(tags);
    });
  });

  describe('findOne', () => {
    it('should return a single tag', async () => {
      const tag = { id: 1, tag: 'Test Tag' } as TagEntity;
      (repository.findOne as jest.Mock).mockResolvedValue(tag);

      const result = await service.findOne(1);
      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(tag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return a tag', async () => {
      const updateTagDto: UpdateTagDto = { name: 'Updated Tag' };
      const existingTag = { id: 1, tag: 'Old Tag' } as TagEntity;
      const updatedTag = { ...existingTag, tag: updateTagDto.name };

      (repository.findOne as jest.Mock)
        .mockResolvedValueOnce(existingTag) // For findOne(id)
        .mockResolvedValueOnce(null); // For checking conflicting name
      (repository.save as jest.Mock).mockResolvedValue(updatedTag);
      
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(existingTag as any);


      const result = await service.update(1, updateTagDto);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { tag: updateTagDto.name } });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ tag: updateTagDto.name }));
      expect(result.tag).toEqual(updateTagDto.name);
    });

    it('should throw NotFoundException if tag to update not found', async () => {
      const updateTagDto: UpdateTagDto = { name: 'Updated Tag' };
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      
      await expect(service.update(1, updateTagDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated name already exists for another tag', async () => {
      const updateTagDto: UpdateTagDto = { name: 'Existing Tag Name' };
      const currentTag = { id: 1, tag: 'Old Tag' } as TagEntity;
      const conflictingTag = { id: 2, tag: 'Existing Tag Name' } as TagEntity;

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(currentTag as any);
      (repository.findOne as jest.Mock).mockResolvedValueOnce(conflictingTag); // For checking conflicting name

      await expect(service.update(1, updateTagDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a tag', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if tag to remove not found', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});

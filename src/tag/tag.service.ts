import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagEntity } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<TagEntity> {
    const existingTag = await this.tagRepository.findOne({ where: { tag: createTagDto.name } });
    if (existingTag) {
      throw new ConflictException(`Tag with name "${createTagDto.name}" already exists`);
    }
    const newTag = this.tagRepository.create({ tag: createTagDto.name });
    return this.tagRepository.save(newTag);
  }

  async findAll(): Promise<TagEntity[]> {
    return this.tagRepository.find();
  }

  async findOne(id: number): Promise<TagEntity> {
    const tag = await this.tagRepository.findOne(id);
    if (!tag) {
      throw new NotFoundException(`Tag with ID #${id} not found`);
    }
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<TagEntity> {
    const tag = await this.findOne(id); // findOne will throw NotFoundException if not found
    if (updateTagDto.name) {
      // Check if the new name already exists for another tag
      const existingTagWithNewName = await this.tagRepository.findOne({ where: { tag: updateTagDto.name } });
      if (existingTagWithNewName && existingTagWithNewName.id !== id) {
        throw new ConflictException(`Tag with name "${updateTagDto.name}" already exists`);
      }
      tag.tag = updateTagDto.name;
    }
    return this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tag with ID #${id} not found`);
    }
  }
}

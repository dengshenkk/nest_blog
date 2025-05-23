import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@/article/entities/article.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { Repository } from 'typeorm';
import { TagService } from '@/tag/tag.service';
import { TagEntity } from '@/tag/entities/tag.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly tagService: TagService,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const { title, body, summary, categoryId, tagIds, authorId } = createArticleDto;

    const author = await this.userRepository.findOne(authorId);
    if (!author) {
      throw new NotFoundException(`Author with ID #${authorId} not found`);
    }

    let fetchedTags: TagEntity[] = [];
    if (tagIds && tagIds.length > 0) {
      fetchedTags = await Promise.all(
        tagIds.map(tagId => this.tagService.findOne(tagId).catch(err => {
          throw new NotFoundException(`Tag with ID #${tagId} not found. Error: ${err.message}`);
        }))
      );
    }

    const article = this.articleRepository.create({
      title,
      body,
      summary,
      categoryId: categoryId?.toString(), // Cast number to string
      author,
      tags: fetchedTags,
      published: true, // Default to true
    });

    return this.articleRepository.save(article);
  }

  async findAll(): Promise<ArticleEntity[]> {
    return this.articleRepository.find({ relations: ['author', 'tags'] });
  }

  async findOne(id: number): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne(id, { relations: ['author', 'tags'] });
    if (!article) {
      throw new NotFoundException(`Article with ID #${id} not found`);
    }
    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<ArticleEntity> {
    const article = await this.findOne(id); // findOne includes relations and NotFoundException

    // Update basic fields
    if (updateArticleDto.title !== undefined) article.title = updateArticleDto.title;
    if (updateArticleDto.summary !== undefined) article.summary = updateArticleDto.summary;
    if (updateArticleDto.body !== undefined) article.body = updateArticleDto.body;
    if (updateArticleDto.categoryId !== undefined) article.categoryId = updateArticleDto.categoryId?.toString();
    if (updateArticleDto.published !== undefined) article.published = updateArticleDto.published;

    // Update tags if provided
    if (updateArticleDto.tagIds && updateArticleDto.tagIds.length > 0) {
      article.tags = await Promise.all(
        updateArticleDto.tagIds.map(tagId => this.tagService.findOne(tagId).catch(err => {
          throw new NotFoundException(`Tag with ID #${tagId} not found. Error: ${err.message}`);
        }))
      );
    } else if (updateArticleDto.tagIds && updateArticleDto.tagIds.length === 0) {
        article.tags = []; // Clear tags if an empty array is provided
    }
    
    // authorId is typically not updatable. If it needs to be, specific logic would be added here.

    return this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    const result = await this.articleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Article with ID #${id} not found`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@/article/entities/article.entity';
import { Repository } from 'typeorm';
import { TagService } from '@/tag/tag.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly tagService: TagService,
  ) {}

  create({ title, body, summary, categoryId, tagIds }: CreateArticleDto) {
    tagIds.map(async (tag) => {
      return this.tagService.findOne(tag);
    });
    // todo 这里开始
    this.articleRepository.save(this.articleRepository.create());
  }

  findAll() {
    return this.articleRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}

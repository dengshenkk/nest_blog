import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArticleEntity } from './entities/article.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { TagEntity } from '@/tag/entities/tag.entity';
import { Repository } from 'typeorm';
import { TagService } from '@/tag/tag.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { NotFoundException } from '@nestjs/common';

// Mock repositories and services
const mockArticleRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

const mockTagService = () => ({
  findOne: jest.fn(),
});

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: ReturnType<typeof mockArticleRepository>;
  let userRepository: ReturnType<typeof mockUserRepository>;
  let tagService: ReturnType<typeof mockTagService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: getRepositoryToken(ArticleEntity), useFactory: mockArticleRepository },
        { provide: getRepositoryToken(UserEntity), useFactory: mockUserRepository },
        { provide: TagService, useFactory: mockTagService },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get(getRepositoryToken(ArticleEntity));
    userRepository = module.get(getRepositoryToken(UserEntity));
    tagService = module.get(TagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createArticleDto: CreateArticleDto = {
      title: 'Test Title',
      summary: 'Test Summary',
      body: 'Test Body',
      authorId: 1,
      tagIds: [1, 2],
      categoryId: 10,
    };
    const author = { id: 1, username: 'testauthor' } as UserEntity;
    const tags = [
      { id: 1, tag: 'tag1' } as TagEntity,
      { id: 2, tag: 'tag2' } as TagEntity,
    ];
    // Construct the entity that `create` method would produce
    const createdArticleEntity = { 
        title: createArticleDto.title,
        summary: createArticleDto.summary,
        body: createArticleDto.body,
        author: author, 
        tags: tags, 
        published: true, 
        categoryId: createArticleDto.categoryId.toString() 
    } as unknown as ArticleEntity; // Cast to unknown first, then to ArticleEntity for partial match

    const savedArticleEntity = { ...createdArticleEntity, id: 1 } as ArticleEntity;


    it('should create and return an article', async () => {
      userRepository.findOne.mockResolvedValue(author);
      tagService.findOne.mockImplementation(id => Promise.resolve(tags.find(t => t.id === id)));
      articleRepository.create.mockReturnValue(createdArticleEntity); 
      articleRepository.save.mockResolvedValue(savedArticleEntity);

      const result = await service.create(createArticleDto);

      expect(userRepository.findOne).toHaveBeenCalledWith(createArticleDto.authorId);
      expect(tagService.findOne).toHaveBeenCalledWith(createArticleDto.tagIds[0]);
      expect(tagService.findOne).toHaveBeenCalledWith(createArticleDto.tagIds[1]);
      expect(articleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        title: createArticleDto.title,
        author,
        tags,
        published: true,
        categoryId: createArticleDto.categoryId.toString(),
      }));
      expect(articleRepository.save).toHaveBeenCalledWith(createdArticleEntity);
      expect(result).toEqual(savedArticleEntity);
    });

    it('should throw NotFoundException if author not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.create(createArticleDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createArticleDto)).rejects.toThrow(`Author with ID #${createArticleDto.authorId} not found`);
    });

    it('should throw NotFoundException if one or more tags not found', async () => {
      userRepository.findOne.mockResolvedValue(author);
      tagService.findOne.mockImplementation(async id => { // make it async
        if (id === 1) return tags[0];
        if (id === 2) throw new NotFoundException(`Tag with ID #2 not found`); // Simulate one tag not found
        return null;
      });

      await expect(service.create(createArticleDto)).rejects.toThrow(NotFoundException);
      // Check the message of the thrown exception
      try {
        await service.create(createArticleDto)
      } catch (e) {
        expect(e.message).toContain('Tag with ID #2 not found');
      }
    });
    
    it('should create an article without tags if tagIds is empty or not provided', async () => {
        const dtoWithoutTags: CreateArticleDto = { ...createArticleDto, tagIds: [] };
        const entityWithoutTags = { ...createdArticleEntity, tags: [] };
        const savedEntityWithoutTags = { ...entityWithoutTags, id: 1 };

        userRepository.findOne.mockResolvedValue(author);
        articleRepository.create.mockReturnValue(entityWithoutTags);
        articleRepository.save.mockResolvedValue(savedEntityWithoutTags);

        const result = await service.create(dtoWithoutTags);
        expect(tagService.findOne).not.toHaveBeenCalled();
        expect(articleRepository.create).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }));
        expect(result.tags).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const articles = [
        { id: 1, title: 'Article 1' } as ArticleEntity,
        { id: 2, title: 'Article 2' } as ArticleEntity,
      ];
      articleRepository.find.mockResolvedValue(articles);
      const result = await service.findAll();
      expect(articleRepository.find).toHaveBeenCalledWith({ relations: ['author', 'tags'] });
      expect(result).toEqual(articles);
    });
  });

  describe('findOne', () => {
    it('should return a single article with relations', async () => {
      const article = { id: 1, title: 'Test Article' } as ArticleEntity;
      articleRepository.findOne.mockResolvedValue(article);
      const result = await service.findOne(1);
      expect(articleRepository.findOne).toHaveBeenCalledWith(1, { relations: ['author', 'tags'] });
      expect(result).toEqual(article);
    });

    it('should throw NotFoundException if article not found', async () => {
      articleRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateArticleDto: UpdateArticleDto = { title: 'Updated Title', tagIds: [3] };
    const existingArticle = { 
        id: 1, 
        title: 'Old Title', 
        summary: 'Old Summary', 
        body: 'Old Body', 
        tags: [{id: 1, tag: "oldTag"}] 
    } as ArticleEntity; // Needs to be a proper ArticleEntity for .save
    const newTag = { id: 3, tag: 'newTag' } as TagEntity;

    it('should update and return an article', async () => {
      const updatedArticleData = { ...existingArticle, title: updateArticleDto.title, tags: [newTag] };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(existingArticle); // service.findOne is used internally
      tagService.findOne.mockResolvedValue(newTag); 
      articleRepository.save.mockResolvedValue(updatedArticleData);

      const result = await service.update(1, updateArticleDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(tagService.findOne).toHaveBeenCalledWith(3);
      expect(articleRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 1, // ensure it's the same article
        title: updateArticleDto.title,
        tags: [newTag],
      }));
      expect(result.title).toEqual(updateArticleDto.title);
      expect(result.tags).toEqual([newTag]);
    });
    
    it('should clear tags if an empty tagIds array is provided', async () => {
        const dtoWithEmptyTags: UpdateArticleDto = { tagIds: [] };
        const articleWithClearedTags = { ...existingArticle, tags: [] };

        jest.spyOn(service, 'findOne').mockResolvedValue(existingArticle);
        articleRepository.save.mockResolvedValue(articleWithClearedTags);

        const result = await service.update(1, dtoWithEmptyTags);
        expect(articleRepository.save).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }));
        expect(result.tags).toEqual([]);
    });


    it('should throw NotFoundException if article to update not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      await expect(service.update(1, updateArticleDto)).rejects.toThrow(NotFoundException);
    });
     
    it('should throw NotFoundException if a tag to update is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(existingArticle);
      tagService.findOne.mockRejectedValue(new NotFoundException('Tag with ID #3 not found'));

      await expect(service.update(1, updateArticleDto)).rejects.toThrow(NotFoundException);
       try {
        await service.update(1, updateArticleDto)
      } catch (e) {
        expect(e.message).toContain('Tag with ID #3 not found');
      }
    });
  });

  describe('remove', () => {
    it('should remove an article', async () => {
      articleRepository.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(articleRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if article to remove not found', async () => {
      articleRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});

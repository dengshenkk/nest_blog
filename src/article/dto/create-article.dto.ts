export class CreateArticleDto {
  title: string;
  summary: string;
  body: string;
  categoryId?: string;
  tagIds?: string[];
}

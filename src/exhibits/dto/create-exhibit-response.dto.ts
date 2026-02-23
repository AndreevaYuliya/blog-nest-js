export class CreateExhibitResponseDto {
  id!: number;
  imageUrl!: string;
  description!: string;
  userId!: number;
  commentCount?: number;
  createdAt!: Date;
}

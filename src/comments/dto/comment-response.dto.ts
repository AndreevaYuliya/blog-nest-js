export class ResponseCommentDto {
  id!: number;
  text!: string;
  createdAt!: Date;
  user!: {
    id: number;
    username: string;
  };
}

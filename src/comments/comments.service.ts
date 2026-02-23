import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './comment.entity';
import { Exhibit } from 'src/exhibits/exhibit.entity';
import { User } from 'src/users/user.entity';
import { DeleteCommentResponse } from './dto/delete-comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Exhibit)
    private exhibitRepository: Repository<Exhibit>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    text: string,
    exhibitId: number,
    userId: number,
  ): Promise<Comment> {
    const exhibit = await this.exhibitRepository.findOneBy({ id: exhibitId });

    if (!exhibit) {
      throw new NotFoundException(`No exhibit found with ID: ${exhibitId}`);
    }

    const comment = this.commentRepository.create({
      text,
      exhibitId,
      userId,
    });

    const saved = await this.commentRepository.save(comment);

    await this.exhibitRepository.increment(
      { id: exhibitId },
      'commentCount',
      1,
    );

    const user = await this.commentRepository.findOne({
      where: { id: saved.id },
      relations: { user: true },
    });

    if (!user) {
      throw new NotFoundException(
        `Comment with id ${saved.id} not found after creation`,
      );
    }

    return user;
  }

  async findById(id: number): Promise<Comment | null> {
    const comment = await this.commentRepository.findOneBy({ id });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return comment;
  }

  async findByExhibitId(exhibitId: number): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { exhibitId },
      relations: { user: true },
    });

    const exhibit = await this.exhibitRepository.findOneBy({ id: exhibitId });

    if (!exhibit) {
      throw new NotFoundException(`No exhibit found with ID: ${exhibitId}`);
    }

    if (!comments || comments.length === 0) {
      return [];
    }

    return comments;
  }

  async findByUserId(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }

  async delete(id: number, userId: number): Promise<DeleteCommentResponse> {
    const comment = await this.findById(id);
    const message = 'Comment deleted successfully';

    if (!comment) {
      throw new NotFoundException(
        `No comments found for user with ID ${userId}`,
      );
    }

    const user = await this.findByUserId(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (userId !== comment.userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    await this.exhibitRepository.decrement(
      { id: comment.exhibitId },
      'commentCount',
      1,
    );

    await this.commentRepository.delete(id);

    return { id: String(id), message };
  }
}

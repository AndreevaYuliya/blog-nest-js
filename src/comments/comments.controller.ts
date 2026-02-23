import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  Request,
  UnauthorizedException,
  NotFoundException,
  Get,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiCommonErrors } from 'src/decorators/api-common-errors.decorator';
import { User } from 'src/users/user.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ResponseCommentDto } from './dto/comment-response.dto';
import { DeleteCommentResponse } from './dto/delete-comment-response.dto';

@ApiCommonErrors()
@Controller('api/exhibits/:exhibitId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a comment to an exhibit' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiParam({
    name: 'exhibitId',
    description: 'ID of the exhibit to comment on',
    example: '1',
  })
  @ApiBody({ type: CreateCommentDto })
  async create(
    @Param('exhibitId', ParseIntPipe) exhibitId: number,
    @Request() req: { user?: { id: number } },
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<ResponseCommentDto> {
    if (!req.user?.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!exhibitId) {
      throw new NotFoundException(
        `No exhibit found with the provided ID: ${exhibitId}`,
      );
    }

    if (!createCommentDto.text) {
      throw new BadRequestException('Comment text is required');
    }

    return this.commentsService.create(
      createCommentDto.text,
      exhibitId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for an exhibit' })
  async findByExhibitId(
    @Param('exhibitId', ParseIntPipe) exhibitId: number,
  ): Promise<ResponseCommentDto[]> {
    const exhibit = await this.commentsService.findByExhibitId(exhibitId);

    if (!exhibit) {
      throw new NotFoundException(
        `No exhibit found with the provided ID: ${exhibitId}`,
      );
    }

    return this.commentsService.findByExhibitId(exhibitId);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a comment from an exhibit' })
  @ApiParam({
    name: 'commentId',
    description: 'ID of the comment to delete',
    example: '1',
  })
  async remove(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Request() req: { user?: User },
  ): Promise<DeleteCommentResponse> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const deleted = await this.commentsService.delete(commentId, req.user.id);

    return { message: 'Comment deleted', id: String(deleted.id) };
  }
}

import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Get,
  Param,
  BadRequestException,
  UnauthorizedException,
  Delete,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { plainToInstance } from 'class-transformer';

import { ApiCommonErrors } from 'src/decorators/api-common-errors.decorator';

import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { ExhibitsService } from './exhibits.service';
import { User } from 'src/users/user.entity';
import { CreateExhibitDto } from './dto/create-exhibit.dto';
import { QueryExhibitDto } from './dto/exhibit-query.dto';
import { PaginatedExhibitsDto } from './dto/paginated-exhibits.dto';
import { ExhibitResponseDto } from './dto/exhibit-response.dto';
import { CreateExhibitResponseDto } from './dto/create-exhibit-response.dto';

@ApiCommonErrors()
@Controller('api/exhibits')
export class ExhibitsController {
  constructor(
    private exhibitsService: ExhibitsService,

    private readonly notificationService: NotificationsGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new exhibit' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',

      properties: {
        image: { type: 'string', format: 'binary' },

        description: { type: 'string' },
      },
    },
  })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createExhibitDto: CreateExhibitDto,
    @Request() req: { user?: User },
  ): Promise<CreateExhibitResponseDto> {
    if (!file) {
      throw new BadRequestException("Image file isn't loaded");
    }

    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|bmp|webp)$/)) {
      throw new BadRequestException('Only image files are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds the 5MB limit');
    }

    if (!createExhibitDto.description) {
      throw new BadRequestException('Description is required');
    }

    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const exhibit = await this.exhibitsService.create(
      file,
      createExhibitDto.description,
      req.user!.id,
    );

    this.notificationService.handleNewPost({
      message: createExhibitDto.description,
      user: req.user.username,
    });

    return { ...exhibit, userId: req.user.id };
  }

  @Get()
  @ApiOperation({ summary: 'Get all exhibits' })
  @ApiOkResponse({ type: PaginatedExhibitsDto })
  async findAll(@Query() query: QueryExhibitDto) {
    const { page = 1, limit = 10 } = query;

    const exhibits = await this.exhibitsService.findAll(page, limit);

    return { ...exhibits, data: exhibits.data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get exhibits of the authenticated user' })
  async findMyExhibits(
    @Request() req: { user?: User },
    @Query() query: QueryExhibitDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { page = 1, limit = 10 } = query;

    const exhibits = await this.exhibitsService.findAllByUserId(
      req.user.id,
      page,
      limit,
    );

    return plainToInstance(PaginatedExhibitsDto, {
      ...exhibits,
      data: exhibits.data,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exhibit by ID' })
  async findById(@Param('id') id: number): Promise<ExhibitResponseDto> {
    const exhibit = await this.exhibitsService.findByExhibitId(id);

    return exhibit;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete an exhibit by ID' })
  async remove(@Param('id') id: number, @Request() req: { user?: User }) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.exhibitsService.remove(id, req.user.id);
  }
}

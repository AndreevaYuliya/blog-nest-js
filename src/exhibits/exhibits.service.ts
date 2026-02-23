import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { Exhibit } from './exhibit.entity';
import { User } from 'src/users/user.entity';
import { ExhibitResponseDto } from './dto/exhibit-response.dto';

type PaginatedExhibits = {
  data: ExhibitResponseDto[];
  total: number;
  page: number;
  lastPage: number;
};

@Injectable()
export class ExhibitsService {
  constructor(
    @InjectRepository(Exhibit)
    private exhibitRepository: Repository<Exhibit>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    file: Express.Multer.File,
    description: string,
    userId: number,
  ): Promise<Exhibit> {
    const uploadPath = path.join(__dirname, '../..', 'uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadPath, uniqueFilename);

    try {
      fs.writeFileSync(filePath, file.buffer);
    } catch (error) {
      console.error('Error saving file:', error);

      throw new NotFoundException('Failed to save the image file');
    }

    const exhibit = this.exhibitRepository.create({
      imageUrl: `static/${uniqueFilename}`,
      description,
      userId,
    });

    return this.exhibitRepository.save(exhibit);
  }

  async findAll(page: number, limit: number): Promise<PaginatedExhibits> {
    if (!page || page < 1) {
      page = 1;
    }

    if (!limit || limit < 1) {
      limit = 10;
    }

    const [result, total] = await this.exhibitRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: result,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findAllByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedExhibits> {
    if (!page || page < 1) {
      page = 1;
    }

    if (!limit || limit < 1) {
      limit = 10;
    }

    const [result, total] = await this.exhibitRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: result,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findByExhibitId(id: number): Promise<Exhibit> {
    const exhibit = await this.exhibitRepository.findOne({ where: { id } });

    if (!exhibit) {
      throw new NotFoundException(`Exhibit with ID ${id} not found`);
    }

    return exhibit;
  }

  async findByUserId(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(
        `No exhibits found for user with ID ${userId}`,
      );
    }

    return user;
  }

  private removeFile(filePath: string): void {
    const fullPath = path.join(__dirname, '../..', filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    const exhibit = await this.findByExhibitId(id);

    const user = await this.findByUserId(userId);

    if (user?.isAdmin) {
      await this.exhibitRepository.remove(exhibit);

      this.removeFile(exhibit.imageUrl);

      return;
    }

    console.log(
      'types:',
      typeof userId,
      typeof exhibit.userId,
      'values:',
      userId,
      exhibit.userId,
    );

    if (exhibit.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this exhibit',
      );
    }

    await this.exhibitRepository.remove(exhibit);

    this.removeFile(exhibit.imageUrl);
  }
}

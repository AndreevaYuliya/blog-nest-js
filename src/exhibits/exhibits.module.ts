import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationsGateway } from 'src/notifications/notifications.gateway';

import { ExhibitsController } from './exhibits.controller';
import { ExhibitsService } from './exhibits.service';
import { Exhibit } from './exhibit.entity';
import { User } from 'src/users/user.entity';
import { Comment } from 'src/comments/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exhibit, Comment, User])],
  controllers: [ExhibitsController],
  providers: [ExhibitsService, NotificationsGateway],
  exports: [ExhibitsService],
})
export class ExhibitsModule {}

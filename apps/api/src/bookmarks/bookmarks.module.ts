import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { AuthModule } from '../auth/auth.module';

@Module({ imports: [AuthModule], controllers: [BookmarksController] })
export class BookmarksModule {}

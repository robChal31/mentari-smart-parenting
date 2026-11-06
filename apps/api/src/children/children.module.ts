import { Module } from '@nestjs/common';
import { ChildrenController } from './children.controller';

@Module({ controllers: [ChildrenController] })
export class ChildrenModule {}

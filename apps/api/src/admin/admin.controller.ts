import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import {
  contentProductSchema,
  createCategorySchema,
  createContentSchema,
  createLearningPathSchema,
  createProductSchema,
  updateCategorySchema,
  updateContentSchema,
  updateLearningPathSchema,
  updateProductSchema,
  type ContentProductInput,
  type CreateCategoryInput,
  type CreateContentInput,
  type CreateLearningPathInput,
  type CreateProductInput,
  type UpdateCategoryInput,
  type UpdateContentInput,
  type UpdateLearningPathInput,
  type UpdateProductInput,
} from '@mentari/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ok, paginated } from '../common/interceptors/response.interceptor';
import { AdminService } from './admin.service';

const roleSchema = z.object({ role: z.enum(['USER', 'ADMIN', 'EDITOR', 'MODERATOR']) });
const communityToggleSchema = z.object({ value: z.boolean() });

@Roles('ADMIN', 'EDITOR')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // ---------- Overview ----------
  @Get('overview')
  overview() {
    return this.admin.overview().then((data) => ok(data));
  }

  // ---------- Contents ----------
  @Get('contents')
  async listContents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const { items, total } = await this.admin.listContents({ page: pageNum, limit: limitNum, status, q: q?.trim() || undefined });
    return paginated(items, pageNum, limitNum, total);
  }

  @Post('contents')
  createContent(@Body(new ZodValidationPipe(createContentSchema)) body: CreateContentInput) {
    return this.admin.createContent(body).then((data) => ok(data));
  }

  @Patch('contents/:id')
  updateContent(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateContentSchema)) body: UpdateContentInput,
  ) {
    return this.admin.updateContent(id, body).then((data) => ok(data));
  }

  @Delete('contents/:id')
  deleteContent(@Param('id') id: string) {
    return this.admin.deleteContent(id).then((data) => ok(data));
  }

  // ---------- Products ----------
  @Get('products')
  async listProducts(@Query('page') page?: string, @Query('limit') limit?: string, @Query('q') q?: string) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const { items, total } = await this.admin.listProducts({ page: pageNum, limit: limitNum, q: q?.trim() || undefined });
    return paginated(items, pageNum, limitNum, total);
  }

  @Post('products')
  createProduct(@Body(new ZodValidationPipe(createProductSchema)) body: CreateProductInput) {
    return this.admin.createProduct(body).then((data) => ok(data));
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) body: UpdateProductInput,
  ) {
    return this.admin.updateProduct(id, body).then((data) => ok(data));
  }

  @Delete('products/:id')
  deactivateProduct(@Param('id') id: string) {
    return this.admin.deactivateProduct(id).then((data) => ok(data));
  }

  @Patch('products/:id/restore')
  restoreProduct(@Param('id') id: string) {
    return this.admin.restoreProduct(id).then((data) => ok(data));
  }

  // ---------- Learning Paths (ADMIN/EDITOR) ----------
  @Get('learning-paths')
  async listLearningPaths(@Query('page') page?: string, @Query('limit') limit?: string, @Query('q') q?: string) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const { items, total } = await this.admin.listLearningPaths({ page: pageNum, limit: limitNum, q: q?.trim() || undefined });
    return paginated(items, pageNum, limitNum, total);
  }

  @Post('learning-paths')
  createLearningPath(@Body(new ZodValidationPipe(createLearningPathSchema)) body: CreateLearningPathInput) {
    return this.admin.createLearningPath(body).then((data) => ok(data));
  }

  @Get('learning-paths/:id')
  findLearningPath(@Param('id') id: string) {
    return this.admin.findLearningPath(id).then((data) => ok(data));
  }

  @Patch('learning-paths/:id')
  updateLearningPath(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLearningPathSchema)) body: UpdateLearningPathInput,
  ) {
    return this.admin.updateLearningPath(id, body).then((data) => ok(data));
  }

  @Delete('learning-paths/:id')
  deleteLearningPath(@Param('id') id: string) {
    return this.admin.deleteLearningPath(id).then((data) => ok(data));
  }

  // ---------- Community moderation (ADMIN/EDITOR) ----------
  @Get('community/threads')
  async listCommunityThreads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('filter') filter?: string,
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const parsed = filter === 'pinned' || filter === 'locked' || filter === 'flagged' ? filter : undefined;
    const { items, total } = await this.admin.listCommunityThreads({ page: pageNum, limit: limitNum, q: q?.trim() || undefined, filter: parsed });
    return paginated(items, pageNum, limitNum, total);
  }

  @Get('community/threads/:id')
  findCommunityThread(@Param('id') id: string) {
    return this.admin.findCommunityThread(id).then((data) => ok(data));
  }

  @Patch('community/threads/:id/pin')
  setThreadPinned(@Param('id') id: string, @Body(new ZodValidationPipe(communityToggleSchema)) body: { value: boolean }) {
    return this.admin.setThreadPinned(id, body.value).then((data) => ok(data));
  }

  @Patch('community/threads/:id/lock')
  setThreadLocked(@Param('id') id: string, @Body(new ZodValidationPipe(communityToggleSchema)) body: { value: boolean }) {
    return this.admin.setThreadLocked(id, body.value).then((data) => ok(data));
  }

  @Delete('community/threads/:id')
  deleteCommunityThread(@Param('id') id: string) {
    return this.admin.deleteCommunityThread(id).then((data) => ok(data));
  }

  @Delete('community/comments/:id')
  deleteCommunityComment(@Param('id') id: string) {
    return this.admin.deleteCommunityComment(id).then((data) => ok(data));
  }

  // ---------- Categories ----------
  @Post('categories')
  createCategory(@Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput) {
    return this.admin.createCategory(body).then((data) => ok(data));
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryInput,
  ) {
    return this.admin.updateCategory(id, body).then((data) => ok(data));
  }

  // ---------- Users (ADMIN only) ----------
  @Roles('ADMIN')
  @Get('users')
  async listUsers(@Query('page') page?: string, @Query('limit') limit?: string, @Query('q') q?: string) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const { items, total } = await this.admin.listUsers({ page: pageNum, limit: limitNum, q: q?.trim() || undefined });
    return paginated(items, pageNum, limitNum, total);
  }

  @Roles('ADMIN')
  @Patch('users/:id/role')
  setUserRole(@Param('id') id: string, @Body(new ZodValidationPipe(roleSchema)) body: { role: 'USER' | 'ADMIN' | 'EDITOR' | 'MODERATOR' }) {
    return this.admin.setUserRole(id, body.role).then((data) => ok(data));
  }

  // ---------- Content ↔ Product mappings ----------
  @Get('content-products')
  listContentProducts(@Query('contentId') contentId?: string) {
    return this.admin.listContentProducts(contentId || undefined).then((data) => ok(data));
  }

  @Post('content-products')
  upsertContentProduct(@Body(new ZodValidationPipe(contentProductSchema)) body: ContentProductInput) {
    return this.admin.upsertContentProduct(body).then((data) => ok(data));
  }

  @Delete('content-products/:id')
  removeContentProduct(@Param('id') id: string) {
    return this.admin.removeContentProduct(id).then((data) => ok(data));
  }
}

// server/src/modules/tag/index.ts
export * from './tag.model';
export { default as TagModel } from './tag.model';
export * from './tag.schema';

export * as tagService from './tag.service'
export * as tagController from './tag.controller';

export { default as tagRoutes } from './tag.route'
// server/src/middleware/index.ts
export * from './authenticateToken';
export * from './authorizeRoles';
export { default as validateResource } from './validateResource'; // export default riêng
export * from './errorHandler';
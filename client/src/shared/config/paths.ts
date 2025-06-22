// client/src/shared/config/paths.ts
const ROOTS = {
  HOME: '/',
  ADMIN: '/admin',
  DASHBOARD: '/dashboard', // User dashboard
};

export const paths = {
  home: ROOTS.HOME,
  login: '/login',
  register: '/register',
  bookDetail: (slug: string = ':slug') => `/books/${slug}`, // Sửa lại đây từ /book/ thành /books/
  play: (slug: string = ':slug') => `/play/${slug}`,
  
  // Nhóm các đường dẫn admin vào một object
  admin: {
    root: ROOTS.ADMIN,
    manageBooks: `${ROOTS.ADMIN}/manage-books`,
    addBook: `${ROOTS.ADMIN}/manage-books/add`,
    editBook: (bookId: string = ':bookId') => `${ROOTS.ADMIN}/manage-books/edit/${bookId}`,
    
    // Chuẩn bị sẵn cho tương lai
    manageGenres: `${ROOTS.ADMIN}/manage-genres`,
    manageTags: `${ROOTS.ADMIN}/manage-tags`,
    manageLanguages: `${ROOTS.ADMIN}/manage-languages`,
    manageUsers: `${ROOTS.ADMIN}/manage-users`,
  },

  // Đường dẫn cho user dashboard (nếu có)
  dashboard: {
    root: ROOTS.DASHBOARD,
    profile: `${ROOTS.DASHBOARD}/profile`,
  },
};
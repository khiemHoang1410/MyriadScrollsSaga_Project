// client/src/shared/config/paths.ts

export const paths = {
    home: '/',
    login: '/login',
    register: '/register',
    bookDetail: (slug: string) => `/books/${slug}`,
    play: (slug: string) => `/play/${slug}`,
  
    // Các trang cần đăng nhập
    dashboard: '/dashboard',
  
    // Các trang của admin
    admin: {
      manageBooks: '/admin/manage-books',
      addBook: '/admin/manage-books/add',
      editBook: (id: string) => `/admin/manage-books/edit/${id}`,
    },
  };
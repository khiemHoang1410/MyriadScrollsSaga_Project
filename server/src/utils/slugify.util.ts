// server/src/utils/slugify.util.ts
export const generateSlug = (text: string): string => {
  if (typeof text !== 'string' || text.trim() === '') {
    console.log('[generateSlug util] Input text is invalid, returning empty string.'); // Thêm log
    return '';
  }

  console.log('[generateSlug util] Input text:', text); // Thêm log
  let slug = text
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
    if (slug.length > 200) {
      slug = slug.substring(0, 100);
    }
  slug = slug.replace(/^-+|-+$/g, '');
  console.log('[generateSlug util] Output slug:', slug); // Thêm log
  return slug;
};
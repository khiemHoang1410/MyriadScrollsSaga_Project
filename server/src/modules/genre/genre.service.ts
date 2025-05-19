// server/src/modules/genre/genre.service.ts
import GenreModel, { IGenre } from './genre.model';
import { CreateGenreInput, UpdateGenreInput } from './genre.schema'; // Zod schema types
import { AppError } from '@/utils/errors'; // Custom error class
import { HttpStatus, GeneralMessages } from '@/types'; // HTTP status codes and general messages
import { logger } from '@/config'; // Logger

// --- Service Functions for Genre ---

/**
 * Tạo một Genre mới.
 * Slug sẽ được tự động tạo từ 'name' thông qua pre-save hook trong GenreModel.
 * @param input - Dữ liệu để tạo Genre (name, description, isActive)
 * @returns Genre đã được tạo
 * @throws AppError nếu tên Genre đã tồn tại hoặc có lỗi khác
 */
export const createGenre = async (input: CreateGenreInput): Promise<IGenre> => {
  const { name, description, isActive } = input;

  // Model pre-save hook sẽ tự tạo slug từ name.
  // Mình vẫn nên kiểm tra xem name (hoặc slug sẽ được tạo) có bị trùng không ở đây
  // để đưa ra thông báo lỗi thân thiện hơn, trước khi DB báo lỗi unique constraint.
  // Tuy nhiên, pre-save hook trong model hiện tại đã xử lý việc tạo slug.
  // Mongoose sẽ tự báo lỗi nếu 'name' hoặc 'slug' (là unique) bị trùng khi save.

  try {
    const newGenre = await GenreModel.create({
      name,
      description,
      isActive,
      // slug sẽ được model tự điền
    });
    logger.info(`Genre created successfully: ${newGenre.name} (ID: ${newGenre._id})`);
    return newGenre;
  } catch (error: any) {
    // Bắt lỗi unique constraint từ MongoDB (mã lỗi 11000)
    if (error.code === 11000 && error.keyPattern) {
      if (error.keyPattern.name) {
        throw new AppError(
          `Genre name '${name}' already exists.`,
          HttpStatus.CONFLICT // 409 Conflict
        );
      }
      if (error.keyPattern.slug) {
        // Lỗi này ít xảy ra nếu slug được tạo từ name và name là unique,
        // nhưng vẫn có thể xảy ra nếu có cách nào đó tạo slug trùng.
        throw new AppError(
          `Genre slug derived from '${name}' already exists.`,
          HttpStatus.CONFLICT
        );
      }
    }
    logger.error('Error creating genre:', { input, error });
    throw new AppError(
      GeneralMessages.ERROR + ' creating genre.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Lấy tất cả các Genre.
 * Có thể mở rộng để hỗ trợ pagination, filtering, sorting sau này.
 * @returns Mảng các Genre
 */
export const getAllGenres = async (): Promise<IGenre[]> => {
  try {
    // Sắp xếp theo tên alphabet cho dễ nhìn
    const genres = await GenreModel.find().sort({ name: 1 }).lean();
    // .lean() giúp query nhanh hơn và trả về plain JavaScript objects thay vì Mongoose documents,
    // thích hợp nếu chỉ cần đọc dữ liệu. Nếu cần dùng methods của Mongoose document thì bỏ .lean().
    return genres;
  } catch (error: any) {
    logger.error('Error fetching all genres:', { error });
    throw new AppError(
      GeneralMessages.ERROR + ' fetching genres.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Lấy một Genre theo ID.
 * @param genreId - ID của Genre cần lấy
 * @returns Genre tìm thấy hoặc null nếu không tìm thấy
 * @throws AppError nếu ID không hợp lệ hoặc có lỗi khác
 */
export const getGenreById = async (genreId: string): Promise<IGenre | null> => {
  try {
    const genre = await GenreModel.findById(genreId).lean();
    if (!genre) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Genre not found.', HttpStatus.NOT_FOUND);
    }
    return genre;
  } catch (error: any) {
    if (error instanceof AppError) throw error; // Re-throw AppError đã được ném từ trên
    logger.error(`Error fetching genre by ID ${genreId}:`, { error });
    // Kiểm tra lỗi sai định dạng ObjectId của Mongoose
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Genre ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` fetching genre with ID ${genreId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Cập nhật một Genre theo ID.
 * @param genreId - ID của Genre cần cập nhật
 * @param input - Dữ liệu cập nhật (name, description, isActive)
 * @returns Genre đã được cập nhật
 * @throws AppError nếu không tìm thấy Genre, tên bị trùng hoặc có lỗi khác
 */
export const updateGenreById = async (
  genreId: string,
  input: UpdateGenreInput
): Promise<IGenre | null> => {
  const { name, description, isActive } = input;

  // Tạo object chứa các trường cần cập nhật, chỉ thêm vào nếu có giá trị
  const updates: Partial<IGenre> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description; // Cho phép cả null để xóa
  if (isActive !== undefined) updates.isActive = isActive;

  if (Object.keys(updates).length === 0) {
    throw new AppError(GeneralMessages.EMPTY_BODY_ERROR, HttpStatus.BAD_REQUEST);
  }

  try {
    // Option { new: true } để trả về document đã được cập nhật
    // Option { runValidators: true } để chạy các Mongoose validators (ví dụ: maxlength)
    // Slug sẽ được tự động cập nhật bởi pre-save hook nếu 'name' thay đổi
    const updatedGenre = await GenreModel.findByIdAndUpdate(
      genreId,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedGenre) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Genre not found for update.', HttpStatus.NOT_FOUND);
    }
    logger.info(`Genre updated successfully: ${updatedGenre.name} (ID: ${updatedGenre._id})`);
    return updatedGenre;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    // Xử lý lỗi unique constraint nếu tên mới bị trùng
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      throw new AppError(
        `Genre name '${updates.name}' already exists.`,
        HttpStatus.CONFLICT
      );
    }
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
        throw new AppError(
          `Genre slug derived from '${updates.name}' already exists.`,
          HttpStatus.CONFLICT
        );
    }
    logger.error(`Error updating genre by ID ${genreId}:`, { input, error });
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Genre ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` updating genre with ID ${genreId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};


/**
 * Xóa một Genre theo ID.
 * @param genreId - ID của Genre cần xóa
 * @returns True nếu xóa thành công
 * @throws AppError nếu không tìm thấy Genre hoặc có lỗi khác
 */
export const deleteGenreById = async (genreId: string): Promise<boolean> => {
  try {
    const result = await GenreModel.findByIdAndDelete(genreId);
    if (!result) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Genre not found for deletion.', HttpStatus.NOT_FOUND);
    }
    logger.info(`Genre deleted successfully: ${result.name} (ID: ${result._id})`);
    return true;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error deleting genre by ID ${genreId}:`, { error });
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Genre ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` deleting genre with ID ${genreId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};


// (Sau này có thể thêm các service phức tạp hơn, ví dụ: getGenresByBookCount, etc.)
// src/modules/book/book.service.ts
import mongoose, { FilterQuery, PopulateOptions, Types } from 'mongoose';
import BookModel, { IBook, BookStatus, IPageNode, IChoice } from './book.model';
import { CreateBookInput, GetAllBooksQueryInput, UpdateBookInput, /* UpdateBookInput, GetAllBooksQueryInput */ } from './book.schema'; // Sẽ tạo GetAllBooksQueryInput sau
import { AppError } from '@/utils';
import { HttpStatus, GeneralMessages, UserRole } from '@/types';
import LanguageModel from '@/modules/language/language.model';
import GenreModel from '@/modules/genre/genre.model';
import TagModel from '@/modules/tag/tag.model';
import { logger } from '@/config';

// Helper function để kiểm tra sự tồn tại của các IDs (có thể tách ra utils)
async function validateDocumentIds(model: mongoose.Model<any>, ids: string[] | undefined | null, idName: string, entityName: string): Promise<void> {
    if (!ids || ids.length === 0) return;
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
        throw new AppError(`Invalid ${idName} format: ${invalidIds.join(', ')}`, HttpStatus.BAD_REQUEST);
    }
    const count = await model.countDocuments({ _id: { $in: ids } });
    if (count !== ids.length) {
        throw new AppError(`One or more ${entityName} IDs not found.`, HttpStatus.BAD_REQUEST);
    }
}

// Helper function để kiểm tra tính duy nhất trong mảng các object con
function hasUniqueProperty<T, K extends keyof T>(array: T[] | undefined, property: K, entityName: string): boolean {
    if (!array || array.length === 0) return true;
    const values = array.map(item => item[property]);
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== values.length) {
        throw new AppError(`Duplicate ${String(property)} found in ${entityName}. Each ${String(property)} must be unique within the list.`, HttpStatus.BAD_REQUEST);
    }
    return true;
}


export const createBook = async (input: CreateBookInput, authorId: string): Promise<IBook> => {
    const { title, bookLanguage, genres, tags, storyNodes, storyVariables, ...restInput } = input;

    // 1. Validate sự tồn tại của Language, Genres, Tags (giữ nguyên)
    if (!mongoose.Types.ObjectId.isValid(bookLanguage)) {
        throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Language ID.', HttpStatus.BAD_REQUEST);
    }
    const langExists = await LanguageModel.findById(bookLanguage);
    if (!langExists) {
        throw new AppError('Language not found.', HttpStatus.BAD_REQUEST);
    }
    await validateDocumentIds(GenreModel, genres, 'Genre ID', 'Genre');
    await validateDocumentIds(TagModel, tags, 'Tag ID', 'Tag');

    // 2. Đảm bảo và Validate tính duy nhất của nodeId, variable.name, và đặc biệt là choiceId
    if (storyNodes) {
        hasUniqueProperty(storyNodes, 'nodeId', 'Story Nodes');
        storyNodes.forEach(node => {
            if (node.choices && node.choices.length > 0) {
                // **SỬA Ở ĐÂY:** Tự gán choiceId nếu chưa có, TRƯỚC KHI kiểm tra unique
                node.choices.forEach(choice => {
                    if (!choice.choiceId) { // Nếu Zod không gán hoặc client gửi rỗng/undefined
                        choice.choiceId = new Types.ObjectId().toHexString();
                    }
                });
                // Giờ mới kiểm tra unique
                hasUniqueProperty(node.choices as IChoice[], 'choiceId', `Choices for node "${node.nodeId}"`);
            }
        });
    }
    if (storyVariables) {
        hasUniqueProperty(storyVariables, 'name', 'Story Variables');
    }

    const bookDoc = new BookModel({
        ...restInput,
        title,
        bookLanguage,
        genres: genres || [],
        tags: tags || [],
        author: authorId,
        storyNodes: storyNodes || [],
        storyVariables: storyVariables || [],
    });

    try {
        const savedBook = await bookDoc.save();
        // Populate sau khi lưu nếu cần trả về dữ liệu đầy đủ ngay lập tức
        return savedBook.populate([
            { path: 'author', select: 'username email _id' },
            { path: 'bookLanguage', select: 'name code _id' },
            { path: 'genres', select: 'name slug _id' },
            { path: 'tags', select: 'name slug _id' },
        ]);
    } catch (error: any) {
        // Dòng log này RẤT QUAN TRỌNG, bro cố gắng tìm nó trong console server
        logger.error('Error creating book in service (DETAILED LOG):', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            mongoErrorCode: error.code, // Cho lỗi MongoDB như 11000 (unique)
            keyValue: error.keyValue,   // Cho lỗi unique constraint
            errors: error.errors,     // Cho Mongoose ValidationErrors (nếu có)
            originalInput: input      // Input gây ra lỗi
        });

        // --- BẮT ĐẦU THAY ĐỔI TẠM THỜI ĐỂ DEBUG ---
        // Mục đích: Đưa thêm chi tiết lỗi gốc vào message trả về cho Postman
        let detailedErrorMessage = `Original error name: ${error.name}. Original error message: ${error.message}.`;
        if (error.errors && typeof error.errors === 'object') { // Mongoose ValidationError
            detailedErrorMessage += ` Validation errors: ${JSON.stringify(Object.keys(error.errors))}`;
        }
        if (error.keyValue && typeof error.keyValue === 'object') { // MongoDB unique constraint error
            detailedErrorMessage += ` Key violation: ${JSON.stringify(error.keyValue)}`;
        }
        if (error.code) { // MongoDB error code
            detailedErrorMessage += ` MongoErrorCode: ${error.code}.`;
        }
        // Ném AppError với thông điệp lỗi chi tiết hơn (CHỈ DÙNG ĐỂ DEBUG)
        throw new AppError(GeneralMessages.ERROR + ` creating book. DEBUG: ${detailedErrorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR);
        // --- KẾT THÚC THAY ĐỔI TẠM THỜI ĐỂ DEBUG ---

        // Dòng gốc (comment lại khi đang debug):
        // throw new AppError(GeneralMessages.ERROR + ' creating book.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
};

export const getBookById = async (bookId: string, currentUserId?: string, currentUserRoles?: UserRole[]): Promise<IBook | null> => {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Book ID.', HttpStatus.BAD_REQUEST);
    }

    const book = await BookModel.findById(bookId)
        .populate('author', 'username email _id')
        .populate('bookLanguage', 'name code _id')
        .populate('genres', 'name slug _id')
        .populate('tags', 'name slug _id')
        // Cân nhắc populate storyNodes sâu hơn nếu cần thiết, nhưng sẽ làm query nặng hơn
        // .populate({
        //   path: 'storyNodes',
        //   // populate: { path: 'choices' } // Ví dụ populate lồng nhau
        // })
        .lean();

    if (!book) {
        throw new AppError(GeneralMessages.NOT_FOUND + ': Book not found.', HttpStatus.NOT_FOUND);
    }

    const isAuthor = currentUserId && book.author && (book.author as any)._id.toString() === currentUserId;
    const isAdmin = currentUserRoles && currentUserRoles.includes(UserRole.ADMIN);

    if (book.status === BookStatus.DRAFT || book.status === BookStatus.IN_REVIEW || book.status === BookStatus.REJECTED) {
        if (!isAuthor && !isAdmin) {
            throw new AppError('You do not have permission to view this book.', HttpStatus.FORBIDDEN);
        }
    }

    // Dòng 130 sẽ là dòng này:
    return book as unknown as IBook; // << SỬA Ở ĐÂY: Sử dụng ép kiểu hai lần
};

// TODO: Implement other service functions:
export const getAllBooks = async (
    queryParams: GetAllBooksQueryInput,
    currentUserId?: string,
    currentUserRoles?: UserRole[]
): Promise<{ books: IBook[], totalBooks: number, totalPages: number, currentPage: number }> => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        authorId,
        genreIds,
        tagIds,
        languageId,
        status,
        difficulty,
        searchTerm,
    } = queryParams;
    const filter: FilterQuery<IBook> = {};

    // Xử lý filter
    const isAdmin = currentUserRoles && currentUserRoles.includes(UserRole.ADMIN);
    if (status) {
        filter.status = status;
    } else {
        // Nếu không phải admin và không có status filter, chỉ hiển thị sách PUBLISHED
        // Nếu là admin, không filter theo status mặc định (có thể xem tất cả)
        // Nếu người dùng thường, có thể xem sách DRAFT của chính họ
        if (!isAdmin) {
            const orConditions: FilterQuery<IBook>[] = [{ status: BookStatus.PUBLISHED }];
            if (currentUserId) {
                orConditions.push({ author: currentUserId, status: BookStatus.DRAFT });
                // Có thể thêm IN_REVIEW nếu muốn tác giả xem được sách đang review của mình
            }
            filter.$or = orConditions;
        }
    }


    if (authorId) {
        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            throw new AppError('Invalid Author ID format for filtering.', HttpStatus.BAD_REQUEST);
        }
        filter.author = authorId;
    }
    if (genreIds && genreIds.length > 0) {
        filter.genres = { $in: genreIds.filter(id => mongoose.Types.ObjectId.isValid(id)) };
    }
    if (tagIds && tagIds.length > 0) {
        filter.tags = { $in: tagIds.filter(id => mongoose.Types.ObjectId.isValid(id)) };
    }
    if (languageId) {
        if (!mongoose.Types.ObjectId.isValid(languageId)) {
            throw new AppError('Invalid Language ID format for filtering.', HttpStatus.BAD_REQUEST);
        }
        filter.bookLanguage = languageId;
    }
    if (difficulty) {
        filter.difficulty = difficulty;
    }
    if (searchTerm) {
        filter.$text = { $search: searchTerm };
    }

    // Xử lý sort
    const sortOptions: { [key: string]: mongoose.SortOrder } = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Populate options
    const populateOptions: PopulateOptions[] = [
        { path: 'author', select: 'username email _id' },
        { path: 'bookLanguage', select: 'name code _id' },
        { path: 'genres', select: 'name slug _id' },
        { path: 'tags', select: 'name slug _id' },
    ];

    try {
        const totalBooks = await BookModel.countDocuments(filter);
        const totalPages = Math.ceil(totalBooks / limit);
        const booksData = await BookModel.find(filter)
            .populate(populateOptions)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return {
            books: booksData as unknown as IBook[],
            totalBooks,
            totalPages,
            currentPage: page,
        };
    } catch (error: any) {
        // Dòng log này RẤT QUAN TRỌNG
        logger.error('CRITICAL_ERROR_DETAILS fetching all books in service:', { // Đổi tên log key cho dễ tìm
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            mongoErrorCode: error.code,
            mongoKeyValue: error.keyValue,
            mongooseValidationErrors: error.errors,
            filterUsed: filter, // Log cả filter để xem có gì bất thường không
            sortUsed: sortOptions, // Log cả sort
            queryParamsReceived: queryParams
        });

        // --- BẮT ĐẦU THAY ĐỔI TẠM THỜI ĐỂ DEBUG ---
        let detailedErrorMessage = `ServiceError: ${error.name} - ${error.message}.`;
        if (error.errors && typeof error.errors === 'object') {
            detailedErrorMessage += ` Validation On Fields: ${JSON.stringify(Object.keys(error.errors))}.`;
        }
        if (error.code) {
            detailedErrorMessage += ` DB ErrorCode: ${error.code}.`;
        }
        // Ném AppError với thông điệp lỗi chi tiết hơn (CHỈ DÙNG ĐỂ DEBUG)
        throw new AppError(`Failed to fetch books. DEBUG_INFO --- ${detailedErrorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR);
        // --- KẾT THÚC THAY ĐỔI TẠM THỜI ĐỂ DEBUG ---

        // Dòng gốc (comment lại khi đang debug):
        // throw new AppError(GeneralMessages.ERROR + ' fetching books.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
};

export const updateBookById = async (
    bookId: string,
    currentUserId: string, // Giả định currentUserId luôn có nếu đã qua authenticateToken
    currentUserRoles: UserRole[],
    input: UpdateBookInput
): Promise<IBook | null> => {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Book ID.', HttpStatus.BAD_REQUEST);
    }

    const book = await BookModel.findById(bookId);

    if (!book) {
        throw new AppError(GeneralMessages.NOT_FOUND + ': Book not found for update.', HttpStatus.NOT_FOUND);
    }

    // 1. Kiểm tra quyền cập nhật
    // const isAuthor = book.author.toString() === currentUserId;
    const isAdmin = currentUserRoles.includes(UserRole.ADMIN);

    if ( !isAdmin) {
        throw new AppError('You do not have permission to update this book.', HttpStatus.FORBIDDEN);
    }

    // 2. Xử lý các trường hợp đặc biệt và cập nhật dữ liệu
    let contentHasChanged = false;

    if (input.title && input.title !== book.title) {
        book.title = input.title; // slug sẽ được hook trong model tự động cập nhật khi lưu
    }

    // Các trường có thể gán trực tiếp nếu có trong input
    if (input.description !== undefined) book.description = input.description;
    if (input.coverImageUrl !== undefined) book.coverImageUrl = input.coverImageUrl;
    if (input.estimatedReadingTime !== undefined) book.estimatedReadingTime = input.estimatedReadingTime;
    if (input.difficulty !== undefined) book.difficulty = input.difficulty;
    if (input.startNodeId !== undefined) book.startNodeId = input.startNodeId;

    if (input.status !== undefined && input.status !== book.status) {
        book.status = input.status; // publishedAt sẽ được hook trong model xử lý khi lưu
    }

    // Kiểm tra và validate các ID tham chiếu nếu chúng được cập nhật
    if (input.bookLanguage !== undefined && input.bookLanguage !== book.bookLanguage.toString()) { // Đổi tên thành bookLanguage
        if (!mongoose.Types.ObjectId.isValid(input.bookLanguage)) {
            throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid new Book Language ID.', HttpStatus.BAD_REQUEST);
        }
        const langExists = await LanguageModel.findById(input.bookLanguage);
        if (!langExists) {
            throw new AppError('New Book Language not found.', HttpStatus.BAD_REQUEST);
        }
        book.bookLanguage = new mongoose.Types.ObjectId(input.bookLanguage);
    }

    if (input.genres !== undefined) {
        await validateDocumentIds(GenreModel, input.genres, 'Genre ID', 'Genre');
        book.genres = input.genres.map(id => new mongoose.Types.ObjectId(id)) as Types.DocumentArray<Types.ObjectId>; // Cast nếu cần
    }

    if (input.tags !== undefined) {
        await validateDocumentIds(TagModel, input.tags, 'Tag ID', 'Tag');
        book.tags = input.tags.map(id => new mongoose.Types.ObjectId(id)) as Types.DocumentArray<Types.ObjectId>; // Cast nếu cần
    }

    // Xử lý cập nhật storyNodes và storyVariables
    if (input.storyNodes !== undefined) {
        hasUniqueProperty(input.storyNodes, 'nodeId', 'New Story Nodes');
        input.storyNodes.forEach(node => {
            if (node.choices && node.choices.length > 0) {
                node.choices.forEach(choice => {
                    if (!choice.choiceId) {
                        (choice as any).choiceId = new Types.ObjectId().toHexString();
                    }
                });
                hasUniqueProperty(node.choices as IChoice[], 'choiceId', `New Choices for node "${node.nodeId}"`);
            }
        });
        book.storyNodes = input.storyNodes as Types.DocumentArray<IPageNode>;
        contentHasChanged = true;
    }

    if (input.storyVariables !== undefined) {
        hasUniqueProperty(input.storyVariables, 'name', 'New Story Variables');
        book.storyVariables = input.storyVariables as Types.DocumentArray<any>; // Cast cho phù hợp
        contentHasChanged = true;
    }

    // 3. Cập nhật contentUpdatedAt nếu nội dung truyện thay đổi
    if (contentHasChanged || (input.storyNodes && input.storyNodes.length !== book.storyNodes.length) || (input.storyVariables && input.storyVariables.length !== (book.storyVariables?.length || 0) )) {
        // Cập nhật nếu có thay đổi rõ ràng về mảng hoặc contentHasChanged=true
        book.contentUpdatedAt = new Date();
    }


    try {
        const updatedBook = await book.save();
        return updatedBook.populate([
            { path: 'author', select: 'username email _id' },
            { path: 'bookLanguage', select: 'name code _id' }, // Đổi tên thành bookLanguage
            { path: 'genres', select: 'name slug _id' },
            { path: 'tags', select: 'name slug _id' },
        ]);
    } catch (error: any) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            throw new AppError(`Book with this ${field} '${error.keyValue[field]}' already exists.`, HttpStatus.CONFLICT);
        }
        logger.error('CRITICAL_ERROR_DETAILS updating book in service:', { /* ... chi tiết lỗi ... */ }); // Giữ lại log debug
        // ... (throw AppError với message debug như đã làm) ...
        let detailedErrorMessage = `ServiceError: ${error.name} - ${error.message}.`;
        if (error.errors && typeof error.errors === 'object') { detailedErrorMessage += ` Validation On Fields: ${JSON.stringify(Object.keys(error.errors))}.`; }
        if (error.keyValue && typeof error.keyValue === 'object') { detailedErrorMessage += ` DB Key Violation: ${JSON.stringify(error.keyValue)}.`; }
        if (error.code) { detailedErrorMessage += ` DB ErrorCode: ${error.code}.`; }
        throw new AppError(`Failed to update book. DEBUG_INFO --- ${detailedErrorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
};

export const deleteBookById = async (
    bookId: string,
    currentUserId: string,
    currentUserRoles: UserRole[]
): Promise<boolean> => {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Book ID.', HttpStatus.BAD_REQUEST);
    }

    const book = await BookModel.findById(bookId).select('author'); // Chỉ lấy author để kiểm tra quyền

    if (!book) {
        throw new AppError(GeneralMessages.NOT_FOUND + ': Book not found for deletion.', HttpStatus.NOT_FOUND);
    }

    // 1. Kiểm tra quyền xóa
    // const isAuthor = book.author.toString() === currentUserId;
    const isAdmin = currentUserRoles.includes(UserRole.ADMIN);

    if ( !isAdmin) {
        throw new AppError('You do not have permission to delete this book.', HttpStatus.FORBIDDEN);
    }

    // 2. Xóa sách
    try {
        const deleteResult = await BookModel.findByIdAndDelete(bookId);
        if (!deleteResult) { // Kiểm tra lại một lần nữa nếu findByIdAndDelete không tìm thấy (hiếm khi xảy ra nếu findById ở trên đã tìm thấy)
             throw new AppError(GeneralMessages.NOT_FOUND + ': Book not found for deletion, possibly deleted by another process.', HttpStatus.NOT_FOUND);
        }
        logger.info(`Book with ID ${bookId} deleted by user ${currentUserId}.`);
        return true;
    } catch (error: any) {
        logger.error('CRITICAL_ERROR_DETAILS deleting book in service:', { // Log lỗi chi tiết
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            mongoErrorCode: error.code,
            bookIdAttempted: bookId,
            userIdAttempting: currentUserId
        });
        // Ném AppError với thông điệp lỗi chi tiết hơn (CHỈ DÙNG ĐỂ DEBUG nếu cần, hoặc giữ lại log)
        let detailedErrorMessage = `ServiceError: ${error.name} - ${error.message}.`;
        if (error.code) { detailedErrorMessage += ` DB ErrorCode: ${error.code}.`; }
        throw new AppError(`Failed to delete book. DEBUG_INFO --- ${detailedErrorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
};
// TODO: (Advanced) Service functions for managing PageNodes, Choices, StoryVariables within a book

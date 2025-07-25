// src/modules/book/book.service.ts
import mongoose, { FilterQuery, PopulateOptions, Types } from 'mongoose';
import BookModel, { IBook, BookStatus, IPageNode, IChoice, ChoiceConditionOperator, ContentBlockType, PageNodeType, IPlainPageNode, IPlainChoice, IPlainContentBlock, ILeanBook, IPlainChoiceEffect, ChoiceEffectOperator } from './book.model';
import { CreateBookInput, GetAllBooksQueryInput, UpdateBookInput, /* UpdateBookInput, GetAllBooksQueryInput */ } from './book.schema'; // Sẽ tạo GetAllBooksQueryInput sau
import { AppError } from '@/utils';
import { HttpStatus, GeneralMessages, UserRole } from '@/types';
import LanguageModel from '@/modules/language/language.model';
import GenreModel from '@/modules/genre/genre.model';
import TagModel from '@/modules/tag/tag.model';
import { logger } from '@/config';
import { UserBookProgressModel } from '../progress';



export interface IPlayStateOutput {
    book: ILeanBook; // <-- THAY bookId bằng cả object book
    currentNode: IPlainPageNode;
    availableChoices: IPlainChoice[];
    variablesState: Record<string, any>;
    isBookCompletedOverall?: boolean;
    currentEndingId?: string | null;
}


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

// --- Helper functions for Play Logic ---
const findNodeById = (nodes: IPlainPageNode[], nodeId: string): IPlainPageNode | null => {
    if (!nodes || !nodeId) return null;
    return nodes.find(node => node.nodeId === nodeId) || null;
};

const processContentPlaceholders = (content: string, variables: Map<string, any>): string => {
    if (!content || typeof content !== 'string') return content;
    // Regex để tìm {{variableName}} hoặc {{ variableName }} (có khoảng trắng)
    return content.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, variableName) => {
        const trimmedVarName = variableName.trim(); // Đảm bảo trim lại lần nữa
        return variables.has(trimmedVarName) ? String(variables.get(trimmedVarName)) : match; // Giữ nguyên match nếu không tìm thấy biến
    });
};

const checkChoiceConditions = (choice: IPlainChoice, variables: Map<string, any>): boolean => {
    if (!choice.conditions || choice.conditions.length === 0) {
        return true;
    }
    for (const condition of choice.conditions) {
        const varName = condition.variableName;
        const playerVarValue = variables.get(varName);
        const comparisonValue = condition.comparisonValue;
        let conditionMet = false;
        switch (condition.operator) {
            case ChoiceConditionOperator.EQUALS: conditionMet = playerVarValue == comparisonValue; break;
            case ChoiceConditionOperator.NOT_EQUALS: conditionMet = playerVarValue != comparisonValue; break;
            case ChoiceConditionOperator.GREATER_THAN: conditionMet = typeof playerVarValue === 'number' && typeof comparisonValue === 'number' && playerVarValue > comparisonValue; break;
            case ChoiceConditionOperator.LESS_THAN: conditionMet = typeof playerVarValue === 'number' && typeof comparisonValue === 'number' && playerVarValue < comparisonValue; break;
            case ChoiceConditionOperator.GREATER_THAN_OR_EQUAL: conditionMet = typeof playerVarValue === 'number' && typeof comparisonValue === 'number' && playerVarValue >= comparisonValue; break;
            case ChoiceConditionOperator.LESS_THAN_OR_EQUAL: conditionMet = typeof playerVarValue === 'number' && typeof comparisonValue === 'number' && playerVarValue <= comparisonValue; break;
            case ChoiceConditionOperator.CONTAINS:
                if (Array.isArray(playerVarValue)) conditionMet = playerVarValue.includes(comparisonValue);
                else if (typeof playerVarValue === 'string' && typeof comparisonValue === 'string') conditionMet = playerVarValue.includes(comparisonValue);
                break;
            case ChoiceConditionOperator.NOT_CONTAINS:
                if (Array.isArray(playerVarValue)) conditionMet = !playerVarValue.includes(comparisonValue);
                else if (typeof playerVarValue === 'string' && typeof comparisonValue === 'string') conditionMet = !playerVarValue.includes(comparisonValue);
                break;
            case ChoiceConditionOperator.IS_DEFINED: conditionMet = playerVarValue !== undefined && playerVarValue !== null; break;
            case ChoiceConditionOperator.IS_UNDEFINED: conditionMet = playerVarValue === undefined || playerVarValue === null; break;
            default: logger.warn(`Unsupported condition operator: ${condition.operator}`); return false;
        }
        if (!conditionMet) return false;
    }
    return true;
};


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
        logger.error('Error creating book in service (DETAILED LOG):', {
            name: error.name, message: error.message, stack: error.stack, mongoErrorCode: error.code, keyValue: error.keyValue, errors: error.errors, originalInput: input
        });
        let detailedErrorMessage = `Original error name: ${error.name}. Original error message: ${error.message}.`;
        if (error.errors && typeof error.errors === 'object') { detailedErrorMessage += ` Validation errors: ${JSON.stringify(Object.keys(error.errors))}`; }
        if (error.keyValue && typeof error.keyValue === 'object') { detailedErrorMessage += ` Key violation: ${JSON.stringify(error.keyValue)}`; }
        if (error.code) { detailedErrorMessage += ` MongoErrorCode: ${error.code}.`; }
        throw new AppError(GeneralMessages.ERROR + ` creating book. DEBUG: ${detailedErrorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
};


export const getBook = async (identifier: string, currentUserId?: string, currentUserRoles?: UserRole[]): Promise<IBook | null> => {
    // --- CÁC DÒNG DEBUG ---
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query: FilterQuery<IBook> = isObjectId
        ? { _id: identifier }
        : { slug: identifier };

    const book = await BookModel.findOne(query)
        .populate('author', 'username email _id')
        .populate('bookLanguage', 'name code _id')
        .populate('genres', 'name slug _id')
        .populate('tags', 'name slug _id')
        .lean<ILeanBook | null>();

    // --- HẾT CÁC DÒNG DEBUG ---

    if (!book) {
        throw new AppError(GeneralMessages.NOT_FOUND + ': Book not found.', HttpStatus.NOT_FOUND);
    }

    const isAuthor = currentUserId && book.author && (book.author as any)._id.toString() === currentUserId;
    const isAdmin = currentUserRoles && currentUserRoles.includes(UserRole.ADMIN);

    if (book.status !== BookStatus.PUBLISHED && !isAdmin) {
        throw new AppError('You do not have permission to view this book.', HttpStatus.FORBIDDEN);
    }
    return book as unknown as IBook;
};

// TODO: Implement other service functions:
export const getAllBooks = async (
    queryParams: GetAllBooksQueryInput,
    currentUserId?: string,
    currentUserRoles?: UserRole[]
): Promise<{ books: ILeanBook[], totalBooks: number, totalPages: number, currentPage: number }> => {

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
            books: booksData as unknown as ILeanBook[],
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

    if (!isAdmin) {
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
    if (input.fontFamily !== undefined) book.fontFamily = input.fontFamily;
    if (input.status !== undefined && input.status !== book.status) book.status = input.status;
    if (input.layoutType !== undefined) book.layoutType = input.layoutType;

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
    if (contentHasChanged || (input.storyNodes && input.storyNodes.length !== book.storyNodes.length) || (input.storyVariables && input.storyVariables.length !== (book.storyVariables?.length || 0))) {
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

    if (!isAdmin) {
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

// --- SERVICE CHO PLAY LOGIC ---
export const startOrGetPlayState = async (
    slug: string,
    userId: string,
    userRoles: UserRole[]
): Promise<IPlayStateOutput> => {

    const book = await BookModel.findOne({ slug }).lean<ILeanBook | null>();
    if (!book) {
        throw new AppError(GeneralMessages.NOT_FOUND + ': Book not found.', HttpStatus.NOT_FOUND);
    }
    const bookId = book._id.toString();

    const isAdmin = userRoles.includes(UserRole.ADMIN);
    // << SỬA ĐIỀU KIỆN CHECK QUYỀN >>
    if (book.status !== BookStatus.PUBLISHED && !isAdmin) {
        logger.warn(`User [${userId}] denied access to non-published book [${bookId}], status: ${book.status}`);
        throw new AppError('This book is not currently available for playing.', HttpStatus.FORBIDDEN);
    }

    if (!book.startNodeId || !book.storyNodes || book.storyNodes.length === 0) {
        logger.error(`Book [${bookId}] is not properly configured (missing startNodeId or empty storyNodes).`);
        throw new AppError('This book is not properly configured for playing.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let userProgress = await UserBookProgressModel.findOne({ userId: new Types.ObjectId(userId), bookId: new Types.ObjectId(bookId) });
    let currentVariablesStateMap = new Map<string, any>();
    let actualCurrentNodeId: string;

    if (userProgress) {
        logger.info(`Found existing progress for user [${userId}] on book [${bookId}]. Current node from DB: ${userProgress.currentNodeId}`);
        if (userProgress.variablesState) {
            currentVariablesStateMap = new Map(userProgress.variablesState.entries()); // Đã sửa ở lần trước
        }
        actualCurrentNodeId = userProgress.currentNodeId || book.startNodeId;
    } else {
        logger.info(`No existing progress for user [${userId}] on book [${bookId}]. Initializing new progress.`);
        if (book.storyVariables && book.storyVariables.length > 0) {
            book.storyVariables.forEach(varDef => {
                currentVariablesStateMap.set(varDef.name, varDef.initialValue);
            });
        }
        actualCurrentNodeId = book.startNodeId;

        // << SỬA LỖI LOGIC Ở ĐÂY >>
        const variablesObjectForCreate = Object.fromEntries(currentVariablesStateMap); // Tạo object SAU KHI currentVariablesStateMap được populate

        userProgress = await UserBookProgressModel.create({
            userId: new Types.ObjectId(userId),
            bookId: new Types.ObjectId(bookId),
            currentNodeId: actualCurrentNodeId,
            variablesState: variablesObjectForCreate, // Sử dụng object đã có dữ liệu
            lastPlayedAt: new Date(),
            startedAt: new Date(),
        });
        logger.info(`Created new progress for user [${userId}], book [${bookId}], node [${actualCurrentNodeId}]`);
    }

    const storyNodesArray: IPlainPageNode[] = book.storyNodes; // Vì book đã là ILeanBook
    let currentPageNode = findNodeById(storyNodesArray, actualCurrentNodeId);

    if (!currentPageNode) {
        logger.error(`Current node ID [${actualCurrentNodeId}] not found in book [${bookId}]'s storyNodes. Resetting to startNodeId.`);
        actualCurrentNodeId = book.startNodeId;
        currentPageNode = findNodeById(storyNodesArray, actualCurrentNodeId);
        if (!currentPageNode) {
            logger.error(`Critical: Start node ID [${actualCurrentNodeId}] also not found in book [${bookId}].`);
            throw new AppError('Book data is corrupted or start node is invalid.', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        currentVariablesStateMap = new Map<string, any>();
        if (book.storyVariables && book.storyVariables.length > 0) {
            book.storyVariables.forEach(varDef => {
                currentVariablesStateMap.set(varDef.name, varDef.initialValue);
            });
        }

        const variablesObjectForUpdate = Object.fromEntries(currentVariablesStateMap);
        // userProgress.variablesState = variablesObjectForUpdate as any; // Đã sửa ở lần trước
        // Cách an toàn hơn để update Mongoose Map từ plain object:
        userProgress.set('variablesState', variablesObjectForUpdate);


        userProgress.currentNodeId = actualCurrentNodeId;
        await userProgress.save();
        logger.info(`Progress reset for user [${userId}], book [${bookId}] to node [${actualCurrentNodeId}]`); // << SỬA LOG SPAN
    }

    const processedContentBlocks = currentPageNode.contentBlocks.map((block: IPlainContentBlock) => {
        let value = block.value;
        if ((block.type === ContentBlockType.TEXT || block.type === ContentBlockType.DIALOGUE) && typeof block.value === 'string') {
            value = processContentPlaceholders(block.value, currentVariablesStateMap);
        }
        return { ...block, value }; // block đã là plain object
    });

    const availableChoices = (currentPageNode.choices || [])
        .filter(choice => checkChoiceConditions(choice, currentVariablesStateMap)) // choice đã là IPlainChoice
        .map(choice => choice as IPlainChoice); // Đảm bảo kiểu trả về

    if (userProgress && userProgress.lastPlayedAt && !(userProgress as any).isNew) {
        userProgress.lastPlayedAt = new Date();
        await userProgress.save();
    }

    const variablesStateObject: Record<string, any> = {};
    currentVariablesStateMap.forEach((value, key) => {
        variablesStateObject[key] = value;
    });

    const plainCurrentNodeWithProcessedContent: IPlainPageNode = { // Ép kiểu tường minh
        ...(currentPageNode as IPlainPageNode), // currentPageNode đã là IPlainPageNode
        contentBlocks: processedContentBlocks as IPlainContentBlock[], // Ép kiểu tường minh
        choices: availableChoices // availableChoices đã là IPlainChoice[]
    };

    return {
        book: book,
        currentNode: plainCurrentNodeWithProcessedContent,
        availableChoices,
        variablesState: variablesStateObject,
        isBookCompletedOverall: userProgress?.isCompletedOverall || false,
        currentEndingId: currentPageNode.nodeType === PageNodeType.ENDING ? currentPageNode.nodeId : null,
    };
};

// << FUNCTION ĐỂ ÁP DỤNG EFFECTS >>

const applyChoiceEffects = (
    effects: IPlainChoiceEffect[] | undefined, // Nhận vào mảng các plain effect objects
    currentVariables: Map<string, any> // Map JS chứa trạng thái biến hiện tại
): Map<string, any> => { // Trả về Map JS mới đã được cập nhật
    if (!effects || effects.length === 0) {
        return currentVariables; // Không có effect thì trả về trạng thái cũ
    }

    const newVariables = new Map(currentVariables); // Tạo bản sao để không thay đổi trực tiếp map cũ

    effects.forEach(effect => {
        const varName = effect.variableName;
        const currentValue = newVariables.get(varName); // Lấy giá trị hiện tại của biến từ bản sao
        const effectValue = effect.value; // Giá trị từ định nghĩa effect (có thể là số, chuỗi, boolean)

        logger.debug(`Applying effect: Variable [${varName}], Operator [${effect.operator}], EffectValue [${effectValue}], CurrentValue [${currentValue}]`);

        switch (effect.operator) {
            case ChoiceEffectOperator.SET:
                newVariables.set(varName, effectValue);
                break;
            case ChoiceEffectOperator.ADD:
                if (typeof currentValue === 'number' && typeof effectValue === 'number') {
                    newVariables.set(varName, currentValue + effectValue);
                } else if (currentValue === undefined && typeof effectValue === 'number') { // Nếu biến chưa có, coi như là 0 + effectValue
                    newVariables.set(varName, effectValue);
                }
                else {
                    logger.warn(`Effect ADD failed: Variable [${varName}] (current: ${currentValue}) or EffectValue [${effectValue}] is not a number or setup incorrectly.`);
                }
                break;
            case ChoiceEffectOperator.SUBTRACT:
                if (typeof currentValue === 'number' && typeof effectValue === 'number') {
                    newVariables.set(varName, currentValue - effectValue);
                } else if (currentValue === undefined && typeof effectValue === 'number') { // Nếu biến chưa có, coi như là 0 - effectValue
                    newVariables.set(varName, -effectValue);
                } else {
                    logger.warn(`Effect SUBTRACT failed: Variable [${varName}] (current: ${currentValue}) or EffectValue [${effectValue}] is not a number or setup incorrectly.`);
                }
                break;
            case ChoiceEffectOperator.INCREMENT:
                if (typeof currentValue === 'number') {
                    newVariables.set(varName, currentValue + 1);
                } else {
                    newVariables.set(varName, 1); // Nếu biến chưa có hoặc không phải số, khởi tạo là 1
                    logger.warn(`Effect INCREMENT on non-number or undefined variable [${varName}], set to 1.`);
                }
                break;
            case ChoiceEffectOperator.DECREMENT:
                if (typeof currentValue === 'number') {
                    newVariables.set(varName, currentValue - 1);
                } else {
                    newVariables.set(varName, -1); // Nếu biến chưa có hoặc không phải số, khởi tạo là -1
                    logger.warn(`Effect DECREMENT on non-number or undefined variable [${varName}], set to -1.`);
                }
                break;
            case ChoiceEffectOperator.TOGGLE_BOOLEAN:
                if (typeof currentValue === 'boolean') {
                    newVariables.set(varName, !currentValue);
                } else {
                    newVariables.set(varName, true); // Nếu biến chưa có hoặc không phải boolean, mặc định toggle thành true
                    logger.warn(`Effect TOGGLE_BOOLEAN on non-boolean or undefined variable [${varName}], set to true.`);
                }
                break;
            case ChoiceEffectOperator.PUSH: // Thêm phần tử vào mảng
                const currentArrayPush = Array.isArray(currentValue) ? [...currentValue] : [];
                currentArrayPush.push(effectValue);
                newVariables.set(varName, currentArrayPush);
                break;
            case ChoiceEffectOperator.PULL: // Xóa tất cả các lần xuất hiện của phần tử khỏi mảng
                if (Array.isArray(currentValue)) {
                    newVariables.set(varName, currentValue.filter(item => item != effectValue)); // Dùng != để có thể so sánh giá trị cơ bản
                } else {
                    logger.warn(`Effect PULL failed: Variable [${varName}] is not an array.`);
                }
                break;
            default:
                logger.warn(`Unsupported effect operator: [${effect.operator}] for variable [${varName}]`);
        }
        logger.debug(`Variable [${varName}] after effect: [${newVariables.get(varName)}]`);
    });
    return newVariables;
};

// <<SERVICE ĐỂ XỬ LÝ PLAYER CHOICE >>
export const processPlayerChoice = async (
    slug: string,
    userId: string,
    currentNodeIdFromPlayer: string,
    selectedChoiceId: string,
    userRoles: UserRole[] // Có thể dùng để check quyền đặc biệt nếu admin chơi thử
): Promise<IPlayStateOutput> => {

    // 1. Lấy Sách và UserBookProgress
    const book = await BookModel.findOne({ slug }).lean<ILeanBook | null>();
    if (!book) {
        logger.warn(`Book not found: [${slug}] during choice processing for user [${userId}]`);
        throw new AppError(GeneralMessages.NOT_FOUND + ': Book not found.', HttpStatus.NOT_FOUND);
    }
    const bookId = book._id.toString();
    // Sách phải published trừ khi là admin (logic tương tự startOrGetPlayState)
    const isAdmin = userRoles.includes(UserRole.ADMIN);
    if (book.status !== BookStatus.PUBLISHED && !isAdmin) {
        logger.warn(`User [${userId}] attempted to make choice on non-published book [${bookId}]`);
        throw new AppError('This book is not currently available for playing.', HttpStatus.FORBIDDEN);
    }

    let userProgress = await UserBookProgressModel.findOne({ userId: new Types.ObjectId(userId), bookId: new Types.ObjectId(bookId) });
    if (!userProgress) {
        logger.error(`Critical: UserBookProgress not found for user [${userId}], book [${bookId}] when making a choice. User should have started play first.`);
        throw new AppError('Player progress not found. Please start playing the book first.', HttpStatus.BAD_REQUEST);
    }

    // Kiểm tra xem currentNodeId mà player gửi lên có khớp với currentNodeId đã lưu trong progress không
    // Đây là một bước bảo mật quan trọng để tránh user "nhảy cóc" node.
    if (userProgress.currentNodeId !== currentNodeIdFromPlayer) {
        logger.warn(`Node mismatch for user [${userId}], book [${bookId}]: Client on [${currentNodeIdFromPlayer}], Server progress on [${userProgress.currentNodeId}].`);
        // Trả về lỗi hoặc trả về trạng thái của node mà server đang lưu (userProgress.currentNodeId)
        // Tạm thời trả lỗi để client biết có sự không đồng bộ.
        throw new AppError('Current game state mismatch. Please refresh or restart.', HttpStatus.CONFLICT);
    }

    // 2. Tìm PageNode hiện tại và Choice đã chọn trong sách
    const storyNodesArray: IPlainPageNode[] = book.storyNodes;
    const currentPlayerNode = findNodeById(storyNodesArray, userProgress.currentNodeId); // Luôn lấy node từ progress đã lưu
    if (!currentPlayerNode) {
        logger.error(`Current node [${userProgress.currentNodeId}] (from progress) for choice processing not found in book [${bookId}].`);
        throw new AppError('Current page node data is corrupted or missing.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const selectedChoice = (currentPlayerNode.choices || []).find(c => c.choiceId === selectedChoiceId);
    if (!selectedChoice) {
        logger.warn(`Selected choiceId [${selectedChoiceId}] not found in current node [${userProgress.currentNodeId}] of book [${bookId}].`);
        throw new AppError('Invalid choice selected.', HttpStatus.BAD_REQUEST);
    }

    // 3. Lấy và kiểm tra `conditions` của Choice đã chọn
    let currentVariablesStateMap = new Map<string, any>();
    if (userProgress.variablesState) {
        currentVariablesStateMap = new Map(userProgress.variablesState.entries());
    }

    if (!checkChoiceConditions(selectedChoice, currentVariablesStateMap)) {
        logger.warn(`User [${userId}] failed condition check for choice [${selectedChoiceId}] on node [${userProgress.currentNodeId}]. Variables: ${JSON.stringify(Object.fromEntries(currentVariablesStateMap))}`);
        throw new AppError('This choice is not currently available due to unmet conditions.', HttpStatus.FORBIDDEN);
    }

    // 4. Áp dụng `effects` của Choice
    const updatedVariablesStateMap = applyChoiceEffects(selectedChoice.effects, currentVariablesStateMap);

    // 5. Xác định nextNodeId và Cập nhật UserBookProgress
    const nextNodeId = selectedChoice.nextNodeId;

    userProgress.currentNodeId = nextNodeId;
    userProgress.variablesState = Object.fromEntries(updatedVariablesStateMap) as any; // Gán lại object
    if (!userProgress.completedNodes.includes(currentPlayerNode.nodeId)) {
        userProgress.completedNodes.push(currentPlayerNode.nodeId);
    }
    userProgress.lastPlayedAt = new Date();

    const nextNodeForEndingCheck = findNodeById(storyNodesArray, nextNodeId);
    if (nextNodeForEndingCheck && nextNodeForEndingCheck.nodeType === PageNodeType.ENDING) {
        if (!userProgress.completedEndings.includes(nextNodeId)) {
            userProgress.completedEndings.push(nextNodeId);
        }
        userProgress.isCompletedOverall = true; // Hoặc logic phức tạp hơn
        logger.info(`User [${userId}] reached ending [${nextNodeId}] in book [${bookId}].`);
    }

    await userProgress.save();
    logger.info(`User [${userId}] progress updated for book [${bookId}]. New current node: [${nextNodeId}]`);

    // 6. Lấy PageNode tiếp theo và chuẩn bị dữ liệu trả về
    const nextPageNode = findNodeById(storyNodesArray, nextNodeId);
    if (!nextPageNode) {
        logger.error(`Next node ID [${nextNodeId}] (from choice [${selectedChoiceId}]) not found in book [${bookId}]. This indicates a story logic error.`);
        // Đây có thể là một kết thúc không tường minh hoặc lỗi thiết kế của người viết truyện
        // Trong trường hợp này, có thể coi là một dạng "ending" hoặc báo lỗi.
        // Tạm thời báo lỗi nghiêm trọng để người viết truyện biết và sửa.
        throw new AppError('The story path is broken or has reached an unexpected end. Please contact the author.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Xử lý content và choices cho node tiếp theo
    const processedNextContentBlocks = nextPageNode.contentBlocks.map(block => {
        let value = block.value;
        if ((block.type === ContentBlockType.TEXT || block.type === ContentBlockType.DIALOGUE) && typeof block.value === 'string') {
            value = processContentPlaceholders(block.value, updatedVariablesStateMap);
        }
        return { ...block, value }; // block đã là plain object
    });

    const availableNextChoices = (nextPageNode.choices || [])
        .filter(choice => checkChoiceConditions(choice, updatedVariablesStateMap)) // choice đã là plain object
        .map(choice => choice as IPlainChoice);

    const nextVariablesStateObject: Record<string, any> = {};
    updatedVariablesStateMap.forEach((value, key) => {
        nextVariablesStateObject[key] = value;
    });

    const plainNextNodeWithProcessedContent: IPlainPageNode = {
        ...(nextPageNode as IPlainPageNode),
        contentBlocks: processedNextContentBlocks as IPlainContentBlock[],
        choices: availableNextChoices // Gán lại choices đã được xử lý và filter
    };

    return {
        book: book,
        currentNode: plainNextNodeWithProcessedContent,
        availableChoices: availableNextChoices,
        variablesState: nextVariablesStateObject,
        isBookCompletedOverall: userProgress.isCompletedOverall,
        currentEndingId: nextPageNode.nodeType === PageNodeType.ENDING ? nextPageNode.nodeId : null,
    };
};

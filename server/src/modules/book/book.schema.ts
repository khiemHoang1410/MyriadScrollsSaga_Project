// src/modules/book/book.schema.ts
import { z } from 'zod';
import {
    ContentBlockType,
    ChoiceConditionOperator,
    ChoiceEffectOperator,
    BookStatus,
    BookDifficulty,
    PageNodeType,
    StoryVariableType,
    StoryVariableScope,
} from './book.model'; // Import các enum từ book.model
import { generateSlug } from '@/utils/slugify.util'; //
import { Types } from 'mongoose';

const SLUG_VALIDATION_MESSAGE_BOOK =
    'Book title must be able to form a valid slug (e.g., contain letters or numbers). It cannot consist only of special characters that are removed during slug generation.';

// --- Helper Schemas for Subdocuments ---

// Schema cho ContentBlock với value được validate dựa trên type
const contentBlockSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal(ContentBlockType.TEXT),
        value: z.string({ required_error: 'Text content value is required.' }).min(1, "Text content cannot be empty."),
        characterName: z.string().trim().max(100).nullable().optional(),
        characterAvatar: z.string().trim().url({ message: 'Invalid URL for character avatar.' }).nullable().optional(),
    }),
    z.object({
        type: z.literal(ContentBlockType.IMAGE),
        value: z.string({ required_error: 'Image URL is required.' }).url({ message: 'Invalid URL for image value.' }),
        characterName: z.string().trim().max(100).nullable().optional(), // Có thể không cần cho IMAGE
        characterAvatar: z.string().trim().url({ message: 'Invalid URL for character avatar.' }).nullable().optional(), // Có thể không cần cho IMAGE
    }),
    z.object({
        type: z.literal(ContentBlockType.AUDIO_SFX),
        value: z.string({ required_error: 'Audio SFX URL is required.' }).url({ message: 'Invalid URL for audio SFX value.' }),
        characterName: z.string().trim().max(100).nullable().optional(),
        characterAvatar: z.string().trim().url({ message: 'Invalid URL for character avatar.' }).nullable().optional(),
    }),
    z.object({
        type: z.literal(ContentBlockType.AUDIO_BGM),
        value: z.string({ required_error: 'Audio BGM URL is required.' }).url({ message: 'Invalid URL for audio BGM value.' }),
        characterName: z.string().trim().max(100).nullable().optional(),
        characterAvatar: z.string().trim().url({ message: 'Invalid URL for character avatar.' }).nullable().optional(),
    }),
    z.object({
        type: z.literal(ContentBlockType.DIALOGUE),
        value: z.string({ required_error: 'Dialogue text is required.' }).min(1, "Dialogue text cannot be empty."), // Lời thoại
        characterName: z.string({ required_error: 'Character name for dialogue is required.' }).trim().min(1).max(100),
        characterAvatar: z.string().trim().url({ message: 'Invalid URL for character avatar.' }).nullable().optional(),
    }),
    z.object({
        type: z.literal(ContentBlockType.VARIABLE_SET), // Ví dụ: value có thể là { variable: "playerName", value: "Khiem" }
        value: z.object({
            variableName: z.string({ required_error: 'Variable name for set is required.' }).min(1),
            newValue: z.any({ required_error: 'New value for variable set is required.' }) // Kiểu của newValue nên khớp với StoryVariableType
        }, { required_error: 'Value for variable set must be an object with variableName and newValue.' }),
        characterName: z.string().trim().max(100).nullable().optional(), // Thường không cần cho VARIABLE_SET
        characterAvatar: z.string().trim().url({ message: 'Invalid URL for character avatar.' }).nullable().optional(), // Thường không cần cho VARIABLE_SET
    }),
], {
    errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
            return { message: `Invalid content block type. Expected one of: ${Object.values(ContentBlockType).join(', ')}` };
        }
        return { message: ctx.defaultError };
    }
});

// Schema cho ChoiceCondition
const choiceConditionSchema = z.object({
    variableName: z.string({ required_error: 'Condition variable name is required.' }).trim().min(1, 'Condition variable name cannot be empty.'),
    operator: z.nativeEnum(ChoiceConditionOperator, {
        required_error: 'Condition operator is required.',
    }),
    comparisonValue: z.any().optional(), // Optional vì IS_DEFINED/IS_UNDEFINED không cần
}).refine(data => {
    // Nếu operator không phải IS_DEFINED hoặc IS_UNDEFINED thì comparisonValue là bắt buộc
    if (data.operator !== ChoiceConditionOperator.IS_DEFINED && data.operator !== ChoiceConditionOperator.IS_UNDEFINED) {
        return data.comparisonValue !== undefined && data.comparisonValue !== null;
    }
    return true;
}, {
    message: "Comparison value is required for the selected operator.",
    path: ["comparisonValue"],
});


// Schema cho ChoiceEffect
const choiceEffectSchema = z.object({
    variableName: z.string({ required_error: 'Effect variable name is required.' }).trim().min(1, 'Effect variable name cannot be empty.'),
    operator: z.nativeEnum(ChoiceEffectOperator, {
        required_error: 'Effect operator is required.',
    }),
    value: z.any().optional(), // Optional vì một số operator không cần (INCREMENT, DECREMENT, TOGGLE_BOOLEAN)
}).refine(data => {
    // Nếu operator không phải INCREMENT, DECREMENT, TOGGLE_BOOLEAN thì value là bắt buộc
    if (data.operator !== ChoiceEffectOperator.INCREMENT &&
        data.operator !== ChoiceEffectOperator.DECREMENT &&
        data.operator !== ChoiceEffectOperator.TOGGLE_BOOLEAN) {
        return data.value !== undefined && data.value !== null;
    }
    return true;
}, {
    message: "Value is required for the selected effect operator.",
    path: ["value"],
});

// Schema cho Choice
const choiceSchema = z.object({
    choiceId: z.string().trim().min(1, 'Choice ID cannot be empty.')
                  .default(() => new Types.ObjectId().toHexString()), // Tự sinh nếu client không gửi
    text: z.string({ required_error: 'Choice text is required.' }).trim().min(1, 'Choice text cannot be empty.').max(500, 'Choice text cannot exceed 500 characters.'),
    nextNodeId: z.string({ required_error: 'Next node ID for choice is required.' }).trim().min(1, 'Next node ID cannot be empty.'),
    conditions: z.array(choiceConditionSchema).optional().default([]),
    effects: z.array(choiceEffectSchema).optional().default([]),
    isHiddenInitially: z.boolean().optional().default(false),
    feedbackText: z.string().trim().max(300).nullable().optional(),
  });

// Schema cho PageNode
const pageNodeSchema = z.object({
    nodeId: z.string({ required_error: 'Node ID is required.' }).trim().min(1, 'Node ID cannot be empty.'),
    title: z.string().trim().max(250).nullable().optional(),
    nodeType: z.nativeEnum(PageNodeType, {
        required_error: 'Node type is required.',
    }).default(PageNodeType.STORY),
    contentBlocks: z.array(contentBlockSchema) // Sử dụng contentBlockSchema đã có discriminatedUnion
        .min(1, 'Page node must have at least one content block.'),
    choices: z.array(choiceSchema).optional().default([]),
    autoNavigateToNodeId: z.string().trim().min(1).nullable().optional(),
});

// Schema cho StoryVariableDefinition
const storyVariableDefinitionSchema = z.object({
    name: z.string({ required_error: 'Variable name is required.' }).trim().min(1, 'Variable name cannot be empty.').max(100, 'Variable name cannot exceed 100 characters.'),
    type: z.nativeEnum(StoryVariableType, {
        required_error: 'Variable type is required.',
    }),
    initialValue: z.any({ required_error: 'Initial value for variable is required.' }),
    scope: z.nativeEnum(StoryVariableScope, {
        required_error: 'Variable scope is required.',
    }).default(StoryVariableScope.INTERNAL_ONLY),
    description: z.string().trim().max(500).nullable().optional(),
}).refine(data => {
    switch (data.type) {
        case StoryVariableType.NUMBER:
            return typeof data.initialValue === 'number';
        case StoryVariableType.STRING:
            return typeof data.initialValue === 'string';
        case StoryVariableType.BOOLEAN:
            return typeof data.initialValue === 'boolean';
        case StoryVariableType.ARRAY_STRING:
            return Array.isArray(data.initialValue) && data.initialValue.every(item => typeof item === 'string');
        case StoryVariableType.ARRAY_NUMBER:
            return Array.isArray(data.initialValue) && data.initialValue.every(item => typeof item === 'number');
        default:
            // Nếu type không nằm trong danh sách mong đợi, coi như không hợp lệ
            // Hoặc có thể ném lỗi cụ thể hơn nếu type không được hỗ trợ
            return false;
    }
}, {
    message: "Initial value does not match the specified variable type, or the type itself is invalid.",
    path: ["initialValue"], // Lỗi sẽ được gán cho trường initialValue
});



// --- Main Book Schemas ---
export const getAllBooksSchema = z.object({
    query: z.object({
        page: z.string().optional().default('1').transform(val => parseInt(val, 10)).refine(val => val > 0, { message: 'Page must be a positive number.' }),
        limit: z.string().optional().default('10').transform(val => parseInt(val, 10)).refine(val => val > 0, { message: 'Limit must be a positive number.' }),
        sortBy: z.string().optional().default('createdAt'), // ví dụ: createdAt, title, averageRating
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
        authorId: z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Author ID format.' }).optional(),
        genreIds: z.preprocess(
            (val) => (typeof val === 'string' ? val.split(',') : val), // Chuyển chuỗi 'id1,id2' thành mảng
            z.array(z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Genre ID format in array.' }))
        ).optional(),
        tagIds: z.preprocess(
            (val) => (typeof val === 'string' ? val.split(',') : val),
            z.array(z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Tag ID format in array.' }))
        ).optional(),
        languageId: z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Language ID format.' }).optional(),
        status: z.nativeEnum(BookStatus).optional(),
        difficulty: z.nativeEnum(BookDifficulty).optional(),
        searchTerm: z.string().trim().optional(),
    }),
});
export type GetAllBooksQueryInput = z.infer<typeof getAllBooksSchema>['query'];
// Schema cho phần body khi tạo sách
export const createBookSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Book title is required.' })
            .trim()
            .min(1, 'Book title cannot be empty.')
            .max(200, 'Book title cannot exceed 200 characters.')
            .refine((val) => generateSlug(val).length > 0, { //
                message: SLUG_VALIDATION_MESSAGE_BOOK,
            }),
        description: z.string().trim().max(3000).nullable().optional(),
        coverImageUrl: z.string().trim().url({ message: 'Invalid URL for cover image.' }).nullable().optional(),
        // author: Sẽ được lấy từ req.user.userId, không cần client gửi
        genres: z.array(z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Genre ID format.' })).optional().default([]),
        tags: z.array(z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Tag ID format.' })).optional().default([]),
        bookLanguage: z.string({ required_error: 'Book language ID is required.' }).refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Language ID format.' }),
        status: z.nativeEnum(BookStatus).optional().default(BookStatus.DRAFT),
        // publishedAt: Sẽ được service/model xử lý
        // contentUpdatedAt: Sẽ được service/model xử lý
        // version: Mặc định trong model
        // averageRating, totalRatings, viewsCount: Mặc định trong model
        estimatedReadingTime: z.number().int().min(0).nullable().optional(),
        difficulty: z.nativeEnum(BookDifficulty).nullable().optional(),
        startNodeId: z.string({ required_error: 'Start node ID is required.' }).trim().min(1, 'Start node ID cannot be empty.'),
        storyNodes: z.array(pageNodeSchema).optional().default([]),
        storyVariables: z.array(storyVariableDefinitionSchema).optional().default([]),
    }),
});
export type CreateBookInput = z.infer<typeof createBookSchema>['body'];


// Schema cho phần body khi cập nhật sách
export const updateBookSchema = z.object({
    params: z.object({
        bookId: z.string({ required_error: 'Book ID in params is required.' }).refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Book ID format.' }),
    }),
    body: z.object({
        title: z
            .string()
            .trim()
            .min(1, 'Book title cannot be empty.')
            .max(200, 'Book title cannot exceed 200 characters.')
            .refine((val) => generateSlug(val).length > 0, { //
                message: SLUG_VALIDATION_MESSAGE_BOOK,
            })
            .optional(),
        description: z.string().trim().max(3000).nullable().optional(),
        coverImageUrl: z.string().trim().url({ message: 'Invalid URL for cover image.' }).nullable().optional(),
        genres: z.array(z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Genre ID format.' })).optional(),
        tags: z.array(z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Tag ID format.' })).optional(),
        bookLanguage: z.string({ required_error: 'Book language ID is required.' }).refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Language ID format.' }),
        status: z.nativeEnum(BookStatus).optional(),
        estimatedReadingTime: z.number().int().min(0).nullable().optional(),
        difficulty: z.nativeEnum(BookDifficulty).nullable().optional(),
        startNodeId: z.string().trim().min(1, 'Start node ID cannot be empty.').optional(),
        storyNodes: z.array(pageNodeSchema).optional(), // Cho phép cập nhật toàn bộ mảng
        storyVariables: z.array(storyVariableDefinitionSchema).optional(), // Cho phép cập nhật toàn bộ mảng
    }).refine(data => Object.keys(data).length > 0, {
        message: "Request body for update cannot be empty. At least one field to update must be provided.",
        path: ["body"],
    }),
});
export type UpdateBookInput = z.infer<typeof updateBookSchema>['body'];
export type UpdateBookParams = z.infer<typeof updateBookSchema>['params'];


// Schema cho params khi chỉ cần bookId
export const bookIdParamsSchema = z.object({
    params: z.object({
        bookId: z.string({ required_error: 'Book ID in params is required.' }).refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: 'Invalid Book ID format.' }),
    }),
});


export type BookIdParams = z.infer<typeof bookIdParamsSchema>['params'];




// --- (Tùy chọn) Schemas cho việc quản lý PageNode, Choice riêng lẻ ---
// Nếu bro muốn có API để thêm/sửa/xóa một PageNode hoặc Choice cụ thể
// thay vì cập nhật toàn bộ mảng storyNodes/choices.

// export const pageNodeBodySchema = pageNodeSchema; // Dùng lại pageNodeSchema cho body
// export type PageNodeInput = z.infer<typeof pageNodeBodySchema>;

// export const choiceBodySchema = choiceSchema; // Dùng lại choiceSchema cho body
// export type ChoiceInput = z.infer<typeof choiceBodySchema>;

// export const pageNodeIdParamsSchema = z.object({
//   params: z.object({
//     bookId: z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val)),
//     nodeId: z.string().trim().min(1),
//   }),
// });
// export type PageNodeIdParams = z.infer<typeof pageNodeIdParamsSchema>['params'];

// export const choiceIdParamsSchema = z.object({
//   params: z.object({
//     bookId: z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val)),
//     nodeId: z.string().trim().min(1),
//     choiceId: z.string().trim().min(1),
//   }),
// });
// export type ChoiceIdParams = z.infer<typeof choiceIdParamsSchema>['params'];
'use server';

import {
	PaginatedResponse,
	Response,
} from '@/features/shared/types/response-type';
import { getErrorMessage } from '@/features/shared/utils/get-error-message';
import { idValidator } from '@/features/shared/validators/id-validator';
import { getTodoValidator } from '../validators/get-todos-validator';
import { GetTodosActionQuery } from '../types/get-todos-type';
import { Todo } from '../types/todo-type';
import { validateRequest } from '@/lib/lucia';
import { dbConnect } from '@/lib/mongoose';
import { getTodosService } from '../services/get-todos-service';

export async function getTodosAction(
	userId: string,
	{ limit = 10, page = 1, search = '', type = 'all' }: GetTodosActionQuery,
): Promise<PaginatedResponse<{ todos: Todo[] }> | Response<null>> {
	try {
		await dbConnect();

		const { session } = await validateRequest();
		if (!session) {
			return { ok: false, message: 'Unauthorized', data: null };
		}

		const validatedUserId = await idValidator.parseAsync(userId);
		const validatedQuery = await getTodoValidator.parseAsync({
			limit,
			page,
			search,
		});

		const { todos, totalData } = await getTodosService(
			validatedUserId,
			validatedQuery,
		);

		return {
			ok: true,
			message: 'Todos fetched successfully.',
			data: { todos },
			pagination: {
				limit,
				page,
				totalData,
				totalPages: Math.ceil(totalData / limit),
			},
		};
	} catch (error) {
		return { ok: false, message: getErrorMessage(error), data: null };
	}
}

'use server';

import { Response } from '@/features/shared/types/response-type';
import { getErrorMessage } from '@/features/shared/utils/get-error-message';
import { validateRequest } from '@/lib/lucia';
import { dbConnect } from '@/lib/mongoose';
import { deleteTodoService } from '../services/delete-todo-service';

export async function deleteTodoAction(
	todoId: string,
): Promise<Response<null>> {
	try {
		await dbConnect();

		const { session } = await validateRequest();
		if (!session) {
			throw new Error('Unauthorized!');
		}

		await deleteTodoService(todoId);

		return { ok: true, message: 'Todo deleted.', data: null };
	} catch (error) {
		return { ok: false, message: getErrorMessage(error), data: null };
	}
}

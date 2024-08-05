'use server';

import { UserModel } from '../models/user-model';
import { hash } from 'argon2';
import { registerValidator } from '../validators/auth-validator';
import { env } from '@/config/env';
import { isUserExists } from '../utils/is-user-exists';
import { lucia } from '@/lib/lucia';
import { cookies } from 'next/headers';
import { Response } from '@/features/shared/types/response-type';
import { getErrorMessage } from '@/features/shared/utils/get-error-message';
import { User } from '../types/user-type';

export async function registerAction(
	_: any,
	formData: FormData,
): Promise<Response<null | { user: User }>> {
	try {
		const username = formData.get('username');
		const password = formData.get('password');

		const validatedData = await registerValidator.parseAsync({
			username,
			password,
		});

		const userExists = await isUserExists(validatedData.username);
		if (userExists) {
			return { ok: false, message: 'Username is already used.', data: null };
		}

		const passwordHash = await hash(validatedData.password, {
			salt: env.PW_SALT,
			secret: env.PW_SECRET,
		});

		const user = await UserModel.create({
			username: validatedData.username,
			password: passwordHash,
		});

		const session = await lucia.createSession(user._id.toString(), {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies().set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes,
		);

		return { ok: true, message: 'Registration successful.', data: { user } };
	} catch (error) {
		console.error('🚀 ~ error:', error);
		return { ok: false, message: getErrorMessage(error), data: null };
	}
}

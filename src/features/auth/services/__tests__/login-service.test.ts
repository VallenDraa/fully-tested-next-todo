import {
	INVALID_CREATE_USER,
	USERNAME_TOO_LONG_CREATE_USER,
	INVALID_PASSWORD_CREATE_USER,
} from '@/testing/tests-constants';
import { loginService } from '../login-service';
import { registerService } from '../register-service';
import { makeValidCreateUser } from '@/testing/db/users';
import { UserModel } from '../../models/user-model';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Login Service', async () => {
	const validUser = makeValidCreateUser('loginServiceUser');

	beforeAll(async () => {
		await registerService(validUser);
	});

	afterAll(async () => {
		await UserModel.deleteOne({ username: validUser.username });
	});

	describe('Valid', () => {
		it('Should return user data with the session cookie when credentials are valid', async () => {
			const { user, sessionCookie } = await loginService(validUser);

			expect(user.username).toStrictEqual(validUser.username);
			expect(sessionCookie).toBeDefined();
		});
	});

	describe('Invalid', () => {
		it('Should throw an error when username is invalid', async () => {
			await expect(
				loginService(USERNAME_TOO_LONG_CREATE_USER),
			).rejects.toThrowError('Invalid username or password!');
		});

		it('Should throw an error when password is invalid', async () => {
			await expect(
				loginService(INVALID_PASSWORD_CREATE_USER),
			).rejects.toThrowError('Invalid username or password!');
		});

		it('Should throw an error when both username and password is invalid', async () => {
			await expect(loginService(INVALID_CREATE_USER)).rejects.toThrowError(
				'Invalid username or password!',
			);
		});
	});
});

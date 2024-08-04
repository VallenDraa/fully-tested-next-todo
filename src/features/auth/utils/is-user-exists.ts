import { UserModel } from '../models/user-model';

export const isUserExists = async (username: string) => {
	const isExists = await UserModel.exists({ username });

	return isExists !== null;
};

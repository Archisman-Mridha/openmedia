import { type IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs"
import type { JwtService } from "@nestjs/jwt"
import type { UserEntity } from "@openmedia/backend/modules/business/users/entity"
import type { JWTPayload } from "../strategies/jwt"

export interface SigninOutput {
	userID: number
	accessToken: string
}

export class SigninQuery extends Query<SigninOutput> {
	constructor(readonly user: UserEntity) {
		super()
	}
}

@QueryHandler(SigninQuery)
export class SigninHandler implements IQueryHandler<SigninQuery> {
	constructor(private readonly jwtService: JwtService) {}

	async execute({ user }: SigninQuery): Promise<SigninOutput> {
		const jwtPayload: JWTPayload = { sub: user.id, ...user }
		const accessToken = await this.jwtService.signAsync(jwtPayload)

		return {
			userID: user.id,
			accessToken
		}
	}
}

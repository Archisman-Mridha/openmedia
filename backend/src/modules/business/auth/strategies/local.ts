import { type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { QueryBus } from "@nestjs/cqrs"
import { GqlExecutionContext } from "@nestjs/graphql"
import { AuthGuard, PassportStrategy } from "@nestjs/passport"
import { GetUserQuery } from "@openmedia/backend/modules/business/users/queries/get-user"
import bcrypt from "bcrypt"
import { Strategy } from "passport-local"
import { UserEntity } from "../../users/entity"

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly queryBus: QueryBus) {
		super({
			usernameField: "email"
		})
	}

	async validate(email: string, password: string): Promise<UserEntity> {
		// Ensure that the user exists.
		const user = await this.queryBus.execute(new GetUserQuery({ email }))
		if (!user) throw new UnauthorizedException("Incorrect email or password")

		// Ensure that the provided password is correct.
		const isPasswordCorrect = await bcrypt.compare(password, user.password)
		if (!isPasswordCorrect) throw new UnauthorizedException("Incorrect email or password")

		// NOTE : Notice that in the above error messages, we don't say that an account with the given
		//        email doesn't exist, or password is incorrect.

		return user
	}
}

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
	getRequest(executionContext: ExecutionContext) {
		const graphQLExecutionContext = GqlExecutionContext.create(executionContext)

		const graphQLContext = graphQLExecutionContext.getContext(),
			graphQLArgs = graphQLExecutionContext.getArgs()

		graphQLContext.req.body = { ...graphQLContext.req.body, ...graphQLArgs.args }

		return graphQLContext.req
	}
}

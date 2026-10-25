import { Injectable, UseGuards } from "@nestjs/common"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Mutation, Query, Resolver } from "@nestjs/graphql"
import { Args } from "@openmedia/backend/decorators/args"
import { CurrentUser } from "@openmedia/backend/decorators/current-user"
import { PublicRoute } from "@openmedia/backend/decorators/public-route"
import { signupArgsValidator } from "@openmedia/packages/validators"
import { CreateUserCommand } from "../../users/commands/create-user"
import { UserEntity } from "../../users/entity"
import { SigninQuery } from "../queries/signin"
import { LocalAuthGuard } from "../strategies/local"
import { SigninArgs, SigninOutput, SignupArgs } from "./args"

@Injectable()
@Resolver()
export class AuthResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@PublicRoute()
	@Mutation(() => SigninOutput)
	async signup(@Args(signupArgsValidator) args: SignupArgs) {
		const user = await this.commandBus.execute(new CreateUserCommand(args))

		return this.queryBus.execute(new SigninQuery(user))
	}

	// We don't need to run the signin args validator here,
	// since the args are already used to lookup the corresponding user entity in the database.
	@PublicRoute()
	@UseGuards(LocalAuthGuard)
	@Query(() => SigninOutput)
	async signin(@CurrentUser() user: UserEntity, @Args() _: SigninArgs): Promise<SigninOutput> {
		return this.queryBus.execute(new SigninQuery(user))
	}
}

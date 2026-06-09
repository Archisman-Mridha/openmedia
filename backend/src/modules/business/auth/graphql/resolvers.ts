import { Injectable, UseGuards } from "@nestjs/common"
import type { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Mutation, Query, Resolver } from "@nestjs/graphql"
import { Args } from "@openmedia/backend/decorators/args"
import { CurrentUser } from "@openmedia/backend/decorators/current-user"
import { PublicRoute } from "@openmedia/backend/decorators/public-route"
import { CreateUserCommand } from "../../users/commands/create-user"
import type { UserEntity } from "../../users/entity"
import { SigninQuery } from "../queries/signin"
import { LocalAuthGuard } from "../strategies/local"
import { type SigninArgs, SigninOutput, type SignupArgs } from "./args"

@Injectable()
@Resolver()
export class AuthResolver {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@PublicRoute()
	@Mutation(() => SigninOutput)
	async signup(@Args() args: SignupArgs) {
		const user = await this.commandBus.execute(new CreateUserCommand(args))

		return this.queryBus.execute(new SigninQuery(user))
	}

	@PublicRoute()
	@UseGuards(LocalAuthGuard)
	@Query(() => SigninOutput)
	async signin(@CurrentUser() user: UserEntity, @Args() _: SigninArgs): Promise<SigninOutput> {
		return this.queryBus.execute(new SigninQuery(user))
	}
}

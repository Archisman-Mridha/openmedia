import { createParamDecorator, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"

export const CurrentUser = createParamDecorator(
	(_data: unknown, executionContext: ExecutionContext) => {
		const graphQLExecutionContext = GqlExecutionContext.create(executionContext)

		const user = graphQLExecutionContext.getContext().req.user
		if (!user) throw UnauthorizedException

		return user
	}
)

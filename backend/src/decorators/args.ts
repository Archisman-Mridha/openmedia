import { UnprocessableEntityException } from "@nestjs/common"
import { Args as NestJSGraphQLArgs } from "@nestjs/graphql"
import { createZodValidationPipe } from "nestjs-zod"
import { type ZodType, z } from "zod"

const ZodValidationPipe = createZodValidationPipe({
	createValidationException: (error) =>
		new UnprocessableEntityException({
			message: "Invalid input",
			fieldErrors: error instanceof z.ZodError ? z.flattenError(error).fieldErrors : {}
		})
})

export const Args = (schema?: ZodType) =>
	schema ? NestJSGraphQLArgs("args", new ZodValidationPipe(schema)) : NestJSGraphQLArgs("args")

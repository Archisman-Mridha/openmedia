"use client"

import { Button, FieldError, Form, Input, Label, TextField, toast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { signinArgsValidator } from "@openmedia/packages/validators"
import { useRouter } from "next/navigation"
import { FunctionComponent } from "react"
import { signinAction } from "./action"

export const SigninForm: FunctionComponent = () => {
	const router = useRouter()

	const {
		form: {
			register,
			formState: { errors, isSubmitting }
		},
		handleSubmitWithAction
	} = useHookFormAction(signinAction, zodResolver(signinArgsValidator), {
		actionProps: {
			onSuccess: ({ data: { userID: _ } }) => {
				router.replace("/")
			},
			onError: ({ error }) => {
				if (error.serverError) toast.danger(error.serverError)
			}
		}
	})

	return (
		<Form onSubmit={handleSubmitWithAction}>
			<TextField isRequired isInvalid={!!errors.email} type="email">
				<Label>Email address</Label>
				<Input {...register("email")} placeholder="creator@openmedia.com" />
				<FieldError>{errors.email?.message}</FieldError>
			</TextField>

			<TextField isRequired isInvalid={!!errors.password} type="password">
				<Label>Password</Label>
				<Input {...register("password")} />
				<FieldError>{errors.password?.message}</FieldError>
			</TextField>

			<Button type="submit" isDisabled={isSubmitting}>
				Submit
			</Button>
		</Form>
	)
}

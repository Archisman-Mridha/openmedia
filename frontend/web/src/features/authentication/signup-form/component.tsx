"use client"

import { Button, FieldError, Form, Input, Label, TextField, toast } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { signupArgsValidator } from "@openmedia/packages/validators"
import { useRouter } from "next/navigation"
import { FunctionComponent } from "react"
import { signupAction } from "./action"

export const SignupForm: FunctionComponent = () => {
	const router = useRouter()

	const {
		form: {
			register,
			formState: { errors, isSubmitting }
		},
		handleSubmitWithAction
	} = useHookFormAction(signupAction, zodResolver(signupArgsValidator), {
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
			<TextField isRequired isInvalid={!!errors.name}>
				<Label>Full name</Label>
				<Input {...register("name")} placeholder="Creator" />
				<FieldError>{errors.name?.message}</FieldError>
			</TextField>

			<TextField isRequired isInvalid={!!errors.email} type="email">
				<Label>Email address</Label>
				<Input {...register("email")} placeholder="creator@openmedia.com" />
				<FieldError>{errors.email?.message}</FieldError>
			</TextField>

			<TextField isRequired isInvalid={!!errors.username}>
				<Label>Username</Label>
				<Input {...register("username")} placeholder="creator" />
				<FieldError>{errors.username?.message}</FieldError>
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

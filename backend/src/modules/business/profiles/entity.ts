import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/decorators/legacy"
import { Field, ID, ObjectType } from "@nestjs/graphql"
import { NAME_MAX_LENGTH, USERNAME_MAX_LENGTH } from "@openmedia/packages/validators"
import { IsAlpha } from "class-validator"

const BIO_MAX_LENGTH = 100

@ObjectType({ isAbstract: true })
@Entity({ tableName: "profiles" })
export class ProfileEntity {
	@Field(() => ID)
	@PrimaryKey({ autoincrement: false })
	id: number

	@IsAlpha()
	@Field()
	@Property({ type: "varchar", length: NAME_MAX_LENGTH })
	name: string

	@Field()
	@Unique({ name: "profiles_username_key" })
	@Property({ type: "varchar", length: USERNAME_MAX_LENGTH })
	username: string

	@Field({ nullable: true })
	@Property({ type: "varchar", nullable: true, length: BIO_MAX_LENGTH })
	bio?: string
}

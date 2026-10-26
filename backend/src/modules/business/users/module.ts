import { MikroOrmModule } from "@mikro-orm/nestjs"
import { Module } from "@nestjs/common"
import { CreateUserHandler } from "./commands/create-user"
import { UserEntity } from "./entity"
import { GetUserHandler } from "./queries/get-user"

@Module({
	imports: [MikroOrmModule.forFeature([UserEntity])],
	providers: [
		// Commands.
		CreateUserHandler,

		// Queries.
		GetUserHandler
	]
})
export class UsersModule {}

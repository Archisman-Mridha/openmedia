import { Inject } from "@nestjs/common"
import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import { MEILISEARCH_CLIENT } from "@openmedia/backend/modules/meilisearch/module"
import { MeilisearchIndex } from "@openmedia/backend/utils/meilisearch"
import { Meilisearch } from "meilisearch"
import { ProfileEntity } from "../entity"
import { ProfilePreview } from "../types"

export class IndexProfileCommand extends Command<void> {
	constructor(readonly input: ProfileEntity) {
		super()
	}
}

@CommandHandler(IndexProfileCommand)
export class IndexProfileHandler implements ICommandHandler<IndexProfileCommand> {
	constructor(
		@Inject(MEILISEARCH_CLIENT)
		private readonly meilisearchClient: Meilisearch
	) {}

	async execute({ input }: IndexProfileCommand): Promise<void> {
		await this.meilisearchClient.index<ProfilePreview>(MeilisearchIndex.PROFILES).addDocuments([
			{
				id: input.id,

				name: input.name,
				username: input.username
			}
		])
	}
}

import { Command, CommandHandler, type ICommandHandler } from "@nestjs/cqrs"
import type { ElasticsearchService } from "@nestjs/elasticsearch"
import { ElasticsearchIndex } from "@openmedia/backend/utils/elasticsearch"
import type { ProfileEntity } from "../entity"
import type { ProfileDocument } from "../types"

export class IndexProfileCommand extends Command<void> {
	constructor(readonly input: ProfileEntity) {
		super()
	}
}

@CommandHandler(IndexProfileCommand)
export class IndexProfileHandler implements ICommandHandler<IndexProfileCommand> {
	constructor(private readonly elasticsearchService: ElasticsearchService) {}

	async execute({ input }: IndexProfileCommand): Promise<void> {
		await this.elasticsearchService.index<ProfileDocument>({
			index: ElasticsearchIndex.PROFILES,
			id: input.id.toString(),
			document: input
		})
	}
}

import type { RedisClusterType } from "@keyv/redis"
import { Controller, Get, Inject } from "@nestjs/common"
import {
	HealthCheck,
	type HealthCheckService,
	type HealthIndicatorService,
	type TypeOrmHealthIndicator
} from "@nestjs/terminus"
import { REDIS_CLUSTER_CLIENT } from "@openmedia/backend/modules/redis/module"

@Controller("health")
export class HealthController {
	constructor(
		private readonly healthService: HealthCheckService,
		private readonly healthIndicatorService: HealthIndicatorService,

		private readonly db: TypeOrmHealthIndicator,

		@Inject(REDIS_CLUSTER_CLIENT)
		private readonly redisClusterClient: RedisClusterType
	) {}

	@Get()
	@HealthCheck()
	check() {
		return this.healthService.check([
			// Postgres connection.
			() => this.db.pingCheck("postgres"),

			// Redis connection.
			async () => {
				const indicator = this.healthIndicatorService.check("redis")
				try {
					await this.redisClusterClient.ping()
					return indicator.up()
				} catch (error) {
					return indicator.down({ message: (error as Error).message })
				}
			}
		])
	}
}

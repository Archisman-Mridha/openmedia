import { EventEmitter } from "node:events"
import { Metadata } from "@grpc/grpc-js"
import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { isDevelopmentEnvironment } from "@openmedia/backend/utils/utils"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import {
	CompositePropagator,
	W3CBaggagePropagator,
	W3CTraceContextPropagator
} from "@opentelemetry/core"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc"
import { CompressionAlgorithm } from "@opentelemetry/otlp-exporter-base"
import { NodeSDK, type NodeSDKConfiguration } from "@opentelemetry/sdk-node"
import {
	BatchSpanProcessor,
	ParentBasedSampler,
	TraceIdRatioBasedSampler
} from "@opentelemetry/sdk-trace-base"

EventEmitter.defaultMaxListeners = 20

@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(TelemetryService.name)
	private readonly sdk: NodeSDK

	constructor(configService: ConfigService) {
		const metadata = new Metadata()
		if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
			const headers = JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) as Record<string, string>
			for (const [key, value] of Object.entries(headers)) metadata.set(key, value)
		}

		const traceExporter = new OTLPTraceExporter({
			url: configService.getOrThrow("OTEL_COLLECTOR_URL"),
			metadata,
			compression: CompressionAlgorithm.GZIP
		})

		let sdkConfig: Partial<NodeSDKConfiguration> = {
			traceExporter,

			instrumentations: [
				getNodeAutoInstrumentations({
					// Disable high-volume instrumentations
					"@opentelemetry/instrumentation-fs": { enabled: false },
					"@opentelemetry/instrumentation-dns": { enabled: false },

					// Configure HTTP instrumentation for better trace context
					"@opentelemetry/instrumentation-http": {
						enabled: true,
						ignoreIncomingRequestHook: (req) => {
							// Ignore health check and metrics endpoints.
							return req.url?.includes("/health") || req.url?.includes("/metrics") || false
						}
					}
				})
			],

			textMapPropagator: new CompositePropagator({
				propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()]
			})
		}

		if (!isDevelopmentEnvironment)
			sdkConfig = {
				...sdkConfig,

				sampler: new ParentBasedSampler({
					root: new TraceIdRatioBasedSampler(0.1)
				}),

				spanProcessor: new BatchSpanProcessor(traceExporter, {
					maxExportBatchSize: 200,
					exportTimeoutMillis: 5000,
					scheduledDelayMillis: 2000
				})
			}

		this.sdk = new NodeSDK(sdkConfig)
	}

	// Called once the host module's dependencies have been resolved.
	async onModuleInit(): Promise<void> {
		this.sdk.start()
	}

	// Called after a termination signal (e.g., SIGTERM) has been received.
	async onModuleDestroy(): Promise<void> {
		try {
			await this.sdk.shutdown()
		} catch (error) {
			this.logger.error("Error shutting down OTEL SDK : ", error)
		}
	}
}

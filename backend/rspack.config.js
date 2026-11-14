const { NxAppRspackPlugin } = require("@nx/rspack/app-plugin")
const { join } = require("node:path")

module.exports = {
	resolve: {
		modules: [__dirname, "node_modules"]
	},
	output: {
		path: join(__dirname, "../dist/backend"),
		clean: true,
		...(process.env.NODE_ENV !== "production" && {
			devtoolModuleFilenameTemplate: "[absolute-resource-path]"
		})
	},
	plugins: [
		new NxAppRspackPlugin({
			target: "node",
			compiler: "swc",
			main: join(__dirname, "src/main.ts"),
			tsConfig: join(__dirname, "tsconfig.app.json"),
			optimization: true,
			outputHashing: "none",
			generatePackageJson: true
		}),
		{
			apply(compiler) {
				for (const rule of compiler.options.module.rules) {
					if (rule?.loader === "builtin:swc-loader") rule.options.jsc.target = "es2021"
				}
			}
		}
	]
}

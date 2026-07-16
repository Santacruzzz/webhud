import { generateScssTypingsAndBroadcastChange } from './lib/watchScssChanges';
import { staticServer } from './lib/staticServer';
import config from './../config.json';
import fs from 'fs';
import getConfig from './../webpack.config';
// @ts-ignore
import mime from 'mime';
import path from 'path';
import url from 'url';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

const webpackConfig = getConfig('hotreload') as any;
const port = config.PORT;

// @ts-ignore
const httpServer = new WebpackDevServer(webpack(webpackConfig), {
	publicPath: webpackConfig.output ? webpackConfig.output.publicPath : undefined,
	hot: true,
	historyApiFallback: true,
	clientLogLevel: 'warning',
	compress: true,
	quiet: false,
	noInfo: false,
	stats: {
		assets: false,
		children: false,
		chunks: false,
		chunkModules: false,
		colors: true,
		entrypoints: false,
		hash: false,
		modules: false,
		timings: false,
		version: false
	}
}).listen(port, '0.0.0.0', (err) => {
	if (err) {
		console.log(err);
	}

	console.log('Listening at http://127.0.0.1:' + port);
});

// Serve static files from public
httpServer.listeners('request').forEach((listener) => {
	httpServer.removeListener('request', listener as any);
	httpServer.on('request', (req, res) => {
		const pathname = url.parse(req.url).pathname || '';
		const filePath = path.resolve(`${__dirname}/../public/${pathname}`);

		fs.readFile(filePath, (err, data) => {
			if (err) {
				// If we can't find file in /public/ fallback to webpack
				return listener(req, res);
			}

			res.setHeader('Content-type', mime.getType(pathname));
			res.end(data);
		});
	});
});

staticServer(httpServer);
generateScssTypingsAndBroadcastChange(port);

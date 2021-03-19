import fs from "fs";
import fsExtra from "fs-extra";
import { HttpsProxyAgent } from "https-proxy-agent";
import type { RequestInit as FetchOptions } from "node-fetch";
import path from "path";
import util from "util";

export async function download(
  url: string,
  filePath: string,
  timeoutMillis = 10000
) {
  const { pipeline } = await import("stream");
  const { default: fetch } = await import("node-fetch");
  const streamPipeline = util.promisify(pipeline);
  const fetchOptions: FetchOptions = {
    timeout: timeoutMillis,
  };

  if (process.env.HTTPS_PROXY !== undefined) {
    fetchOptions.agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
  }

  // set http_proxy if https_proxy wasn't already set
  if (
    process.env.HTTP_PROXY !== undefined &&
    fetchOptions.agent === undefined
  ) {
    fetchOptions.agent = new HttpsProxyAgent(process.env.HTTP_PROXY);
  }

  const response = await fetch(url, fetchOptions);

  if (response.ok && response.body !== null) {
    await fsExtra.ensureDir(path.dirname(filePath));
    return streamPipeline(response.body, fs.createWriteStream(filePath));
  }

  // Consume the response stream and discard its result
  // See: https://github.com/node-fetch/node-fetch/issues/83
  const _discarded = await response.arrayBuffer();

  // tslint:disable-next-line only-hardhat-error
  throw new Error(
    `Failed to download ${url} - ${response.statusText} received`
  );
}

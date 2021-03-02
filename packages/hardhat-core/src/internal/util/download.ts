import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";
import util from "util";
import HttpsProxyAgent from "https-proxy-agent";

interface FetchOptions {
  timeout: number;
  agent?: undefined | HttpsProxyAgent.HttpsProxyAgent;
}

function hasHttpProxy(): boolean {
  return 
}

export async function download(
  url: string,
  filePath: string,
  timeoutMillis = 10000
) {
  const { pipeline } = await import("stream");
  const { default: fetch } = await import("node-fetch");
  const streamPipeline = util.promisify(pipeline);
  const fetchOptions = <FetchOptions> { timeout: timeoutMillis, agent: undefined };

  // Check if Proxy is set https
  if (process.env.https_proxy || process.env.HTTPS_PROXY) {       
    // Create the proxy from the environment variables
    const proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
    fetchOptions.agent = new HttpsProxyAgent.HttpsProxyAgent(proxy);
  }
  
  // Check if Proxy is set http and `fetchOptions.agent` was not already set for https
  if ((process.env.http_proxy || process.env.HTTP_PROXY) && fetchOptions.agent === undefined) {       
    // Create the proxy from the environment variables
    const proxy = process.env.http_proxy || process.env.HTTP_PROXY;
    fetchOptions.agent = new HttpsProxyAgent.HttpsProxyAgent(proxy);
  }

  // Fetch the url
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

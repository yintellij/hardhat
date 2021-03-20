import { assert } from "chai";
import fsExtra from "fs-extra";
import path from "path";
import Proxy from "proxy";

import { download } from "../../../src/internal/util/download";
import { useTmpDir } from "../../helpers/fs";

describe("Compiler List download", function () {
  useTmpDir("compiler-downloader");

  describe("basic", function () {
    it("Should call download with the right params", async function () {
      const compilersDir = this.tmpDir;
      const downloadPath = path.join(compilersDir, "downloadedCompiler");
      const expectedUrl = `https://solc-bin.ethereum.org/wasm/list.json`;

      // download the file
      await download(expectedUrl, downloadPath);
      // Assert that the file exists
      assert.isTrue(await fsExtra.pathExists(downloadPath));
    });
  });

  describe("with proxy", function () {
    let oldHttpsProxyEnv: string | undefined;
    let oldHttpProxyEnv: string | undefined;
    let proxy: any;
    let proxyPort: number;
    let connections = 0;

    beforeEach(function (done) {
      // Setup Proxy Server
      proxy = new Proxy();
      connections = 0;
      proxy.on("connection", () => {
        connections += 1;
      });
      proxy.listen(function () {
        proxyPort = proxy.address().port;
        done();
      });
    });

    afterEach(function (done) {
      proxy.close(done);
    });

    describe("Compilers list download with HTTPS_PROXY", function () {
      beforeEach(function () {
        oldHttpsProxyEnv = process.env.HTTPS_PROXY;
        process.env.HTTPS_PROXY = `http://127.0.0.1:${proxyPort}`;
      });

      it("Should call download with the right params", async function () {
        const compilersDir = this.tmpDir;
        const downloadPath = path.join(compilersDir, "downloadedCompilerProxy");
        const expectedUrl = `https://solc-bin.ethereum.org/wasm/list.json`;

        // download the file
        assert.equal(connections, 0);
        await download(expectedUrl, downloadPath);
        assert.equal(connections, 1);

        // Assert that the file exists
        assert.isTrue(await fsExtra.pathExists(downloadPath));
      });

      afterEach(function () {
        if (oldHttpsProxyEnv !== undefined) {
          process.env.HTTPS_PROXY = oldHttpsProxyEnv;
        } else {
          delete process.env.HTTPS_PROXY;
        }
      });
    });

    describe("Compilers list download with HTTP_PROXY", function () {
      beforeEach(function () {
        oldHttpProxyEnv = process.env.HTTP_PROXY;
        process.env.HTTP_PROXY = `http://127.0.0.1:${proxyPort}`;
      });

      it("Should call download with the right params", async function () {
        const compilersDir = this.tmpDir;
        const downloadPath = path.join(compilersDir, "downloadedCompilerProxy");
        const expectedUrl = `https://solc-bin.ethereum.org/wasm/list.json`;

        // download the file
        assert.equal(connections, 0);
        await download(expectedUrl, downloadPath);
        assert.equal(connections, 1);

        // Assert that the file exists
        assert.isTrue(await fsExtra.pathExists(downloadPath));
      });

      afterEach(function () {
        if (oldHttpProxyEnv !== undefined) {
          process.env.HTTP_PROXY = oldHttpProxyEnv;
        } else {
          delete process.env.HTTP_PROXY;
        }
      });
    });

    after(function (done) {
      // Shutdown Proxy Server
      proxy.once("close", function () {
        done();
      });
      proxy.close();
    });
  });
});

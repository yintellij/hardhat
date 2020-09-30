import { assert, expect } from "chai";
import "hardhat/types";

import { TruffleEnvironmentArtifacts } from "./artifacts";

declare module "hardhat/types" {
  export interface Artifacts {
    field2: number;
  }

  export interface HardhatRuntimeEnvironment {
    artifacts: TruffleEnvironmentArtifacts;

    assert: typeof assert;
    expect: typeof expect;
    contract: (
      description: string,
      definition: (accounts: string[]) => any
    ) => void;
  }
}

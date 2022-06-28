import { atom } from "recoil";

import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const voterData = atom({
  key: "voterData",
  default: {},
  effects_UNSTABLE: [persistAtom],
});

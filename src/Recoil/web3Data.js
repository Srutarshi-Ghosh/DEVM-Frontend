import { atom } from "recoil";

import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const web3Data = atom({
  key: "web3",
  default: {
    wallet: "No wallet linked",
  },
  effects_UNSTABLE: [persistAtom],
});

import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { ContainerState, PerpetualPageModals } from './types';
import { Asset } from '../../../types';
import { PerpetualPairType } from '../../../utils/dictionaries/perpetual-pair-dictionary';

// The initial state of the MarginTradePage container
export const initialState: ContainerState = {
  pairType: PerpetualPairType.BTCUSD,
  collateral: Asset.RBTC,
  modal: PerpetualPageModals.NONE,
  modalOptions: undefined,
};

const perpetualPageSlice = createSlice({
  name: 'perpetualPage',
  initialState,
  reducers: {
    setPairType(state, { payload }: PayloadAction<PerpetualPairType>) {
      state.pairType = payload;
    },
    setCollateral(state, { payload }: PayloadAction<Asset>) {
      state.collateral = payload;
    },
    setModal: {
      reducer(
        state,
        { payload, meta }: PayloadAction<PerpetualPageModals, string, any>,
      ) {
        state.modal = payload;
        state.modalOptions = meta;
      },
      prepare(modal: PerpetualPageModals, modalOptions?: any) {
        return { payload: modal, meta: modalOptions };
      },
    },
    reset(state) {
      state = initialState;
    },
  },
});

export const { actions, reducer, name: sliceKey } = perpetualPageSlice;

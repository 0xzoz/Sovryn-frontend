import { useAccount } from 'app/hooks/useAccount';
import { useSendContractTx } from 'app/hooks/useSendContractTx';
import { useContext, useMemo } from 'react';
import { TxType } from 'store/global/transactions-store/types';
import { TradingPosition } from 'types/trading-position';
import { ethGenesisAddress, gasLimit } from 'utils/classifiers';
import { PerpetualQueriesContext } from '../contexts/PerpetualQueriesContext';
import {
  floatToABK64x64,
  PERPETUAL_ID,
  getSignedAmount,
} from '../utils/contractUtils';
import { calculateSlippagePrice, getMidPrice } from '../utils/perpUtils';

const MASK_MARKET_ORDER = 0x40000000;
const MASK_CLOSE_ONLY = 0x80000000;

export const usePerpetual_openTrade = () => {
  const address = useAccount();

  const { ammState, perpetualParameters } = useContext(PerpetualQueriesContext);

  const midPrice = useMemo(() => getMidPrice(perpetualParameters, ammState), [
    perpetualParameters,
    ammState,
  ]);

  const { send, ...rest } = useSendContractTx('perpetualManager', 'trade');

  return {
    trade: async (
      isClosePosition: boolean | undefined = false,
      /** amount as wei string */
      amount: string = '0',
      leverage: number | undefined = 1,
      slippage: number | undefined = 0.5,
      tradingPosition: TradingPosition | undefined = TradingPosition.LONG,
      nonce?: number,
    ) => {
      const signedAmount = getSignedAmount(tradingPosition, amount);

      let tradeDirection = Math.sign(signedAmount);

      const limitPrice = calculateSlippagePrice(
        midPrice,
        slippage,
        tradeDirection,
      );

      const deadline = Math.round(Date.now() / 1000) + 86400; // 1 day
      const timeNow = Math.round(Date.now() / 1000);
      const order = [
        PERPETUAL_ID,
        address,
        floatToABK64x64(signedAmount),
        floatToABK64x64(limitPrice),
        deadline,
        ethGenesisAddress,
        isClosePosition ? MASK_CLOSE_ONLY : MASK_MARKET_ORDER,
        timeNow,
      ];

      await send(
        [order],
        {
          from: address,
          gas: gasLimit[TxType.OPEN_PERPETUAL_TRADE],
          gasPrice: 60,
          nonce,
        },
        { type: TxType.OPEN_PERPETUAL_TRADE },
      );
    },
    txData: rest.txData,
    txHash: rest.txHash,
    loading: rest.loading,
    status: rest.status,
    reset: rest.reset,
  };
};

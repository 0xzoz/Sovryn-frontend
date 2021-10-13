import { useAccount } from 'app/hooks/useAccount';
import { useSendContractTx } from 'app/hooks/useSendContractTx';
import { contractWriter } from 'utils/sovryn/contract-writer';
import { Asset } from 'types';
import { getContract } from 'utils/blockchain/contract-helpers';
import { toWei } from 'web3-utils';
import { gasLimit } from 'utils/classifiers';
import { TxType } from 'store/global/transactions-store/types';
import { PERPETUAL_ID, floatToABK64x64 } from '../utils';

export const usePerpetual_depositMarginToken = () => {
  const account = useAccount();

  const { send, ...rest } = useSendContractTx('perpetualManager', 'deposit');

  return {
    deposit: async (amount: string) => {
      const tx = await contractWriter.checkAndApprove(
        Asset.PERPETUALS,
        getContract('perpetualManager').address,
        toWei(amount),
      );

      if (tx.rejected) {
        return;
      }

      send(
        [PERPETUAL_ID, floatToABK64x64(parseFloat(amount))],
        {
          from: account,
          gas: gasLimit[TxType.DEPOSIT_COLLATERAL],
          nonce: tx?.nonce,
        },
        { type: TxType.DEPOSIT_COLLATERAL },
      );
    },
    ...rest,
  };
};
/**
 *
 * BridgeDepositPage
 *
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWalletContext } from '@sovryn/react-wallet';

import { actions } from '../../slice';
import { Chain } from '../../../../../types';
import { getBridgeChainId } from '../../utils/helpers';
import { selectBridgeDepositPage } from '../../selectors';
import { BridgeNetworkDictionary } from '../../dictionaries/bridge-network-dictionary';
import { BridgeDictionary } from '../../dictionaries/bridge-dictionary';
import { currentChainId } from '../../../../../utils/classifiers';
import { SelectBox } from '../SelectBox';

interface Props {}

export function ChainSelector(props: Props) {
  const { chain } = useSelector(selectBridgeDepositPage);
  const dispatch = useDispatch();

  const walletContext = useWalletContext();

  const selectNetwork = useCallback(
    (chain: Chain) => {
      dispatch(actions.selectNetwork({ chain, walletContext }));
    },
    [dispatch, walletContext],
  );

  const state = useMemo(() => {
    if (
      chain !== null &&
      walletContext.wallet.providerType === 'injected' &&
      walletContext.wallet.isConnected() &&
      walletContext.wallet.chainId !== getBridgeChainId(chain as Chain)
    ) {
      return 'wrong-network';
    }

    return 'choose-network';
  }, [walletContext, chain]);

  const network = useMemo(() => BridgeNetworkDictionary.get(chain as Chain), [
    chain,
  ]);

  // It excludes current dapp chain (no RSK network), but i think it should be there in the end.
  const networks = useMemo(
    () =>
      BridgeDictionary.listNetworks().filter(
        item => item.chainId !== currentChainId,
      ),
    [],
  );

  return (
    <div>
      <div className="tw-mb-20 tw-text-2xl tw-text-center">
        Select Network to deposit from
      </div>
      {state === 'wrong-network' && (
        <div className="tw-text-center">
          Switch your wallet to {network?.name} network.
        </div>
      )}

      {state === 'choose-network' && (
        <div className="tw-flex tw-gap-10 tw-px-2 tw-justify-center">
          {networks.map(item => (
            <SelectBox
              key={item.chain}
              onClick={() => selectNetwork(item.chain)}
            >
              <img
                className="tw-mb-5 tw-mt-2"
                src={item.logo}
                alt={item.chain}
              />
              <div>
                <span className="tw-uppercase">{item.chain} </span> Network
              </div>
            </SelectBox>
          ))}
        </div>
      )}
    </div>
  );
}
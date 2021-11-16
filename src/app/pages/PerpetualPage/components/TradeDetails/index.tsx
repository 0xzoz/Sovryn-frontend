import classNames from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { translations } from '../../../../../locales/i18n';
import { toNumberFormat } from '../../../../../utils/display-text/format';
import { PerpetualPair } from '../../../../../utils/models/perpetual-pair';
import { AssetValue } from '../../../../components/AssetValue';
import { AssetValueMode } from '../../../../components/AssetValue/types';
import { usePerpetual_accountBalance } from '../../hooks/usePerpetual_accountBalance';
import { PerpetualTrade } from '../../types';
import { usePerpetual_queryTraderState } from '../../hooks/usePerpetual_queryTraderState';
import { getTradeDirection } from '../../utils/contractUtils';
import { fromWei } from 'web3-utils';
import { usePerpetual_queryAmmState } from '../../hooks/usePerpetual_queryAmmState';
import { getTraderPnLInBC } from '../../utils/perpUtils';

type TradeDetailsProps = {
  className?: string;
  pair: PerpetualPair;
  trade: PerpetualTrade;
  showUnrealizedPnL?: boolean;
};

export const TradeDetails: React.FC<TradeDetailsProps> = ({
  className,
  pair,
  trade,
  showUnrealizedPnL = false,
}) => {
  const { t } = useTranslation();

  const traderState = usePerpetual_queryTraderState();
  const ammState = usePerpetual_queryAmmState();
  const { available } = usePerpetual_accountBalance(pair.pairType);

  const positionSize = useMemo(
    () => getTradeDirection(trade.position) * Number(fromWei(trade.amount)),
    [trade.position, trade.amount],
  );

  const unrealized = useMemo(() => getTraderPnLInBC(traderState, ammState), [
    traderState,
    ammState,
  ]);

  return (
    <div
      className={classNames(
        'tw-px-4 tw-py-2 tw-bg-gray-4 tw-rounded-lg',
        className,
      )}
    >
      <div className="tw-flex tw-flex-row tw-items-center tw-text-xs">
        <label className="tw-w-1/2 tw-mr-2">
          {t(translations.perpetualPage.currentTrade.position)}
        </label>
        <AssetValue
          className={classNames(
            'tw-font-medium',
            positionSize > 0 ? 'tw-text-trade-long' : 'tw-text-trade-short',
          )}
          minDecimals={3}
          maxDecimals={3}
          mode={AssetValueMode.auto}
          value={positionSize}
          assetString={pair.baseAsset}
        />
      </div>

      <div className="tw-flex tw-flex-row tw-items-center tw-text-xs">
        <label className="tw-w-1/2 tw-mr-2">
          {t(translations.perpetualPage.currentTrade.margin)}
        </label>
        <div>
          <AssetValue
            className="tw-font-medium"
            minDecimals={4}
            maxDecimals={4}
            mode={AssetValueMode.auto}
            value={traderState.availableCashCC}
            assetString={pair.baseAsset}
          />
          <span className="tw-font-medium tw-ml-1">
            ({toNumberFormat(trade.leverage, 2)}x)
          </span>
        </div>
      </div>

      {showUnrealizedPnL ? (
        <div className="tw-flex tw-flex-row tw-items-center tw-text-xs">
          <label className="tw-w-1/2 tw-mr-2">
            {t(translations.perpetualPage.currentTrade.unrealizedPnL)}
          </label>
          <AssetValue
            className={classNames(
              'tw-font-medium',
              unrealized > 0 ? 'tw-text-trade-long' : 'tw-text-trade-short',
            )}
            minDecimals={4}
            maxDecimals={4}
            mode={AssetValueMode.auto}
            value={unrealized}
            assetString={pair.baseAsset}
            showPositiveSign
            useTooltip
          />
        </div>
      ) : (
        <div className="tw-flex tw-flex-row tw-items-center tw-text-xs">
          <label className="tw-w-1/2 tw-mr-2">
            {t(translations.perpetualPage.currentTrade.available)}
          </label>
          <AssetValue
            className="tw-font-medium"
            minDecimals={3}
            maxDecimals={3}
            mode={AssetValueMode.auto}
            value={available}
            assetString={pair.baseAsset}
          />
        </div>
      )}
    </div>
  );
};

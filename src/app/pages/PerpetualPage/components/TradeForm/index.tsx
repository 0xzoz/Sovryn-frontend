import React, { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ErrorBadge } from 'app/components/Form/ErrorBadge';
import { useMaintenance } from 'app/hooks/useMaintenance';
import settingImg from 'assets/images/settings-blue.svg';
import { discordInvite } from 'utils/classifiers';
import { translations } from '../../../../../locales/i18n';
import { TradingPosition } from '../../../../../types/trading-position';
import { PerpetualPairDictionary } from '../../../../../utils/dictionaries/perpetual-pair-dictionary';
import { LeverageSelector } from '../LeverageSelector';
import {
  weiToNumberFormat,
  toNumberFormat,
} from '../../../../../utils/display-text/format';
import classNames from 'classnames';
import { PerpetualTrade, PerpetualTradeType } from '../../types';
import { AssetSymbolRenderer } from '../../../../components/AssetSymbolRenderer';
import { Input } from '../../../../components/Input';
import { fromWei, toWei } from 'web3-utils';
import { PopoverPosition, Tooltip } from '@blueprintjs/core';
import { AssetValue } from '../../../../components/AssetValue';
import { AssetValueMode } from '../../../../components/AssetValue/types';
import { LeverageViewer } from '../LeverageViewer';
import {
  getMaximalTradeSizeInPerpetual,
  getRequiredMarginCollateral,
  getTradingFee,
  calculateLeverageForPosition,
  calculateApproxLiquidationPrice,
  getMidPrice,
} from '../../utils/perpUtils';
import { shrinkToLot } from '../../utils/perpMath';
import { usePerpetual_queryAmmState } from '../../hooks/usePerpetual_queryAmmState';
import { usePerpetual_queryPerpParameters } from '../../hooks/usePerpetual_queryPerpParameters';
import { usePerpetual_marginAccountBalance } from '../../hooks/usePerpetual_marginAccountBalance';
import { getTradeDirection } from '../../utils/contractUtils';
import { usePerpetual_queryTraderState } from '../../hooks/usePerpetual_queryTraderState';

interface ITradeFormProps {
  trade: PerpetualTrade;
  isNewTrade?: boolean;
  onChange: (trade: PerpetualTrade) => void;
  onSubmit: () => void;
  onOpenSlippage: () => void;
}

export const TradeForm: React.FC<ITradeFormProps> = ({
  trade,
  isNewTrade,
  onChange,
  onSubmit,
  onOpenSlippage,
}) => {
  const { t } = useTranslation();
  const { checkMaintenance, States } = useMaintenance();
  const inMaintenance = checkMaintenance(States.PERPETUAL_TRADES);
  const traderState = usePerpetual_queryTraderState();
  const ammState = usePerpetual_queryAmmState();
  const perpParameters = usePerpetual_queryPerpParameters();
  const marginAccountBalance = usePerpetual_marginAccountBalance();

  const [lotSize, lotPrecision] = useMemo(() => {
    const lotSize = Number(perpParameters.fLotSizeBC.toPrecision(8));
    const lotPrecision = lotSize.toString().split(/[,.]/)[1]?.length || 0;

    return [lotSize, lotPrecision];
  }, [perpParameters.fLotSizeBC]);

  const maxTradeSize = useMemo(() => {
    const maxTradeSize = Number(
      Math.abs(
        getMaximalTradeSizeInPerpetual(
          marginAccountBalance.fPositionBC,
          getTradeDirection(trade.position),
          ammState,
          perpParameters,
        ),
      ).toPrecision(8),
    );
    return Number.isFinite(maxTradeSize) ? maxTradeSize : 0;
  }, [
    marginAccountBalance.fPositionBC,
    trade.position,
    ammState,
    perpParameters,
  ]);

  const [amount, setAmount] = useState(fromWei(trade.amount));
  const onChangeOrderAmount = useCallback(
    (amount: string) => {
      const roundedAmount = shrinkToLot(
        Math.max(Math.min(Number(amount) || 0, maxTradeSize), 0),
        lotSize,
      );
      setAmount(amount);
      let newTrade = { ...trade, amount: toWei(roundedAmount.toString()) };
      if (!isNewTrade) {
        newTrade.leverage = calculateLeverageForPosition(
          roundedAmount,
          traderState,
          ammState,
        );
      }
      onChange(newTrade);
    },
    [onChange, trade, lotSize, maxTradeSize, isNewTrade, traderState, ammState],
  );
  const onBlurOrderAmount = useCallback(() => {
    setAmount(fromWei(trade.amount));
  }, [trade.amount]);

  const [limit, setLimit] = useState(trade.limit);
  const onChangeOrderLimit = useCallback(
    (limit: string) => {
      setLimit(limit);
      onChange({ ...trade, limit: toWei(limit) });
    },
    [onChange, trade],
  );

  const onChangeLeverage = useCallback(
    (leverage: number) => {
      onChange({ ...trade, leverage });
    },
    [onChange, trade],
  );

  const pair = useMemo(() => PerpetualPairDictionary.get(trade.pairType), [
    trade.pairType,
  ]);

  const bindSelectPosition = useCallback(
    (position: TradingPosition) => () => onChange({ ...trade, position }),
    [trade, onChange],
  );

  const bindSelectTradeType = useCallback(
    (tradeType: PerpetualTradeType) => () => onChange({ ...trade, tradeType }),
    [trade, onChange],
  );

  const tradeButtonLabel = useMemo(() => {
    const i18nKey = {
      LONG_LIMIT: translations.perpetualPage.tradeForm.buttons.buyLimit,
      LONG_MARKET: translations.perpetualPage.tradeForm.buttons.buyMarket,
      SHORT_LIMIT: translations.perpetualPage.tradeForm.buttons.sellLimit,
      SHORT_MARKET: translations.perpetualPage.tradeForm.buttons.sellMarket,
    }[`${trade.position}_${trade.tradeType}`];
    console.log(i18nKey);

    return i18nKey && t(i18nKey);
  }, [t, trade.position, trade.tradeType]);

  const orderCost = useMemo(
    () =>
      getRequiredMarginCollateral(
        trade.leverage,
        marginAccountBalance.fPositionBC,
        Number(trade.amount),
        perpParameters,
      ),
    [marginAccountBalance.fPositionBC, perpParameters, trade],
  );

  const tradingFee = useMemo(
    () => getTradingFee(Number(trade.amount), perpParameters),
    [perpParameters, trade.amount],
  );

  const midPrice = useMemo(() => getMidPrice(perpParameters, ammState), [
    perpParameters,
    ammState,
  ]);

  const liquidationPrice = useMemo(
    () =>
      calculateApproxLiquidationPrice(
        Number(amount) * getTradeDirection(trade.position),
        traderState.availableCashCC,
        ammState,
        perpParameters,
      ),
    [
      amount,
      trade.position,
      traderState.availableCashCC,
      ammState,
      perpParameters,
    ],
  );

  return (
    <div className="tw-relative tw-h-full tw-pb-16">
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-space-x-2.5 tw-mb-5">
        <button
          className={classNames(
            'tw-w-full tw-h-8 tw-font-semibold tw-text-base tw-text-white tw-bg-trade-long tw-rounded-lg',
            trade.position !== TradingPosition.LONG &&
              'tw-opacity-25 hover:tw-opacity-100 tw-transition-opacity tw-duration-300',
          )}
          onClick={bindSelectPosition(TradingPosition.LONG)}
          // disabled={!validate || !connected || openTradesLocked}
        >
          {t(translations.perpetualPage.tradeForm.buttons.buy)}
        </button>
        <button
          className={classNames(
            'tw-w-full tw-h-8 tw-font-semibold tw-text-base tw-text-white tw-bg-trade-short tw-rounded-lg',
            trade.position !== TradingPosition.SHORT &&
              'tw-opacity-25 hover:tw-opacity-100 tw-transition-opacity tw-duration-300',
          )}
          onClick={bindSelectPosition(TradingPosition.SHORT)}
        >
          {t(translations.perpetualPage.tradeForm.buttons.sell)}
        </button>
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-mb-4">
        <button
          className={classNames(
            'tw-h-8 tw-px-3 tw-py-1 tw-font-semibold tw-text-sm tw-text-sov-white tw-bg-gray-7 tw-rounded-lg',
            trade.tradeType !== PerpetualTradeType.MARKET &&
              'tw-opacity-25 hover:tw-opacity-100 tw-transition-opacity tw-duration-300',
          )}
          onClick={bindSelectTradeType(PerpetualTradeType.MARKET)}
          // disabled={!validate || !connected || openTradesLocked}
        >
          {t(translations.perpetualPage.tradeForm.buttons.market)}
        </button>
        <Tooltip
          hoverOpenDelay={0}
          hoverCloseDelay={0}
          interactionKind="hover"
          position={PopoverPosition.BOTTOM_LEFT}
          content={t(translations.common.comingSoon)}
        >
          <button
            className="tw-h-8 tw-px-3 tw-py-1 tw-font-semibold tw-text-sm tw-text-sov-white tw-bg-gray-7 tw-rounded-lg tw-opacity-25 tw-cursor-not-allowed"
            disabled
          >
            {t(translations.perpetualPage.tradeForm.buttons.limit)}
          </button>
        </Tooltip>
        <div className="tw-flex tw-flex-row tw-items-between tw-justify-between tw-flex-1 tw-ml-2 tw-text-xs">
          <label className="tw-mr-1">
            {t(translations.perpetualPage.tradeForm.labels.maxTradeSize)}
          </label>
          <AssetValue
            minDecimals={0}
            maxDecimals={6}
            mode={AssetValueMode.auto}
            value={maxTradeSize}
            assetString={pair.baseAsset}
          />
        </div>
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-mb-4 tw-text-sm">
        <label>
          {t(translations.perpetualPage.tradeForm.labels.orderValue)}
        </label>
        <div className="tw-flex-1 tw-mx-4 tw-text-right">
          <AssetSymbolRenderer assetString={pair.baseAsset} />
        </div>
        <Input
          className="tw-w-2/5"
          type="number"
          value={amount}
          step={lotSize}
          min={0}
          max={maxTradeSize}
          onChange={onChangeOrderAmount}
          onBlur={onBlurOrderAmount}
        />
      </div>
      <div
        className={classNames(
          'tw-flex tw-flex-row tw-items-center tw-justify-between tw-mb-4 tw-text-sm',
          trade.tradeType !== PerpetualTradeType.LIMIT && 'tw-hidden',
        )}
      >
        <label>
          {t(translations.perpetualPage.tradeForm.labels.limitPrice)}
        </label>
        <div className="tw-flex-1 tw-mx-4 tw-text-right">
          <AssetSymbolRenderer assetString={pair.quoteAsset} />
        </div>
        <Input
          className="tw-w-2/5"
          type="number"
          value={limit}
          step={0.1}
          min={0}
          onChange={onChangeOrderLimit}
        />
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-text-xs tw-font-medium">
        <label>
          {t(translations.perpetualPage.tradeForm.labels.orderCost)}
        </label>
        <AssetValue
          minDecimals={4}
          maxDecimals={4}
          mode={AssetValueMode.auto}
          value={String(orderCost)}
          assetString={pair.baseAsset}
        />
      </div>
      <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-mb-4 tw-text-xs tw-font-medium">
        <label>
          {t(translations.perpetualPage.tradeForm.labels.tradingFee)}
        </label>
        <AssetValue
          minDecimals={4}
          maxDecimals={6}
          mode={AssetValueMode.auto}
          value={String(tradingFee)}
          assetString={pair.baseAsset}
        />
      </div>
      {isNewTrade && (
        <LeverageSelector
          className="tw-mb-2"
          value={trade.leverage}
          min={pair.config.leverage.min}
          max={pair.config.leverage.max}
          steps={pair.config.leverage.steps}
          onChange={onChangeLeverage}
        />
      )}
      <div className="tw-my-2 tw-text-secondary tw-text-xs">
        <button className="tw-flex tw-flex-row" onClick={onOpenSlippage}>
          <Trans
            i18nKey={
              translations.perpetualPage.tradeForm.buttons.slippageSettings
            }
          />
          <img className="tw-ml-2" alt="setting" src={settingImg} />
        </button>
      </div>
      {!isNewTrade && (
        <>
          <LeverageViewer
            className="tw-mt-3 tw-mb-4"
            label={t(translations.perpetualPage.tradeForm.labels.leverage)}
            min={pair.config.leverage.min}
            max={pair.config.leverage.max}
            value={trade.leverage}
            valueLabel={`${toNumberFormat(trade.leverage, 2)}x`}
          />
          <div className="tw-flex tw-flex-row tw-justify-between tw-px-6 tw-py-1 tw-text-xs tw-font-medium tw-border tw-border-gray-5 tw-rounded-lg">
            <label>
              {t(translations.perpetualPage.tradeForm.labels.liquidationPrice)}
            </label>
            <AssetValue
              minDecimals={2}
              maxDecimals={2}
              mode={AssetValueMode.auto}
              value={liquidationPrice}
              assetString={pair.quoteAsset}
            />
          </div>
        </>
      )}
      <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0">
        {!inMaintenance ? (
          <button
            className={classNames(
              'tw-flex tw-flex-row tw-justify-between tw-items-center tw-w-full tw-h-12 tw-px-4 tw-font-semibold tw-text-base tw-text-white tw-bg-trade-long tw-rounded-lg tw-opacity-100 hover:tw-opacity-75 tw-transition-opacity tw-duration-300',
              trade.position === TradingPosition.LONG
                ? 'tw-bg-trade-long'
                : 'tw-bg-trade-short',
            )}
            onClick={onSubmit}
            // disabled={!validate || !connected || openTradesLocked}
          >
            <span className="tw-mr-2">{tradeButtonLabel}</span>
            <span>
              {weiToNumberFormat(trade.amount, lotPrecision)}
              {` @ ${trade.position === TradingPosition.LONG ? '≥' : '≤'} `}
              {toNumberFormat(midPrice, 2)}
            </span>
          </button>
        ) : (
          <ErrorBadge
            content={
              <Trans
                i18nKey={translations.maintenance.openMarginTrades}
                components={[
                  <a
                    href={discordInvite}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="tw-text-warning tw-text-xs tw-underline hover:tw-no-underline"
                  >
                    x
                  </a>,
                ]}
              />
            }
          />
        )}
      </div>
    </div>
  );
};

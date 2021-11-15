import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { translations } from '../../../../../locales/i18n';
import { PerpetualPairDictionary } from '../../../../../utils/dictionaries/perpetual-pair-dictionary';
import { Dialog } from '../../../../containers/Dialog';
import { selectPerpetualPage } from '../../selectors';
import { actions } from '../../slice';
import { isPerpetualTrade, PerpetualPageModals } from '../../types';
import { TradeDetails } from '../TradeDetails';
import { AssetValue } from '../../../../components/AssetValue';
import { AssetValueMode } from '../../../../components/AssetValue/types';
import {
  calculateApproxLiquidationPrice,
  calculateLeverageForMargin,
  getBase2CollateralFX,
} from '../../utils/perpUtils';
import { fromWei, toWei } from 'web3-utils';
import { usePerpetual_queryPerpParameters } from '../../hooks/usePerpetual_queryPerpParameters';
import { usePerpetual_queryAmmState } from '../../hooks/usePerpetual_queryAmmState';
import classNames from 'classnames';
import { LeverageViewer } from '../LeverageViewer';
import { toNumberFormat } from '../../../../../utils/display-text/format';
import { AmountInput } from '../../../../components/Form/AmountInput';
import { usePerpetual_queryTraderState } from '../../hooks/usePerpetual_queryTraderState';
import { usePerpetual_accountBalance } from '../../hooks/usePerpetual_accountBalance';

enum EditMarginDialogMode {
  increase,
  decrease,
}

export const EditMarginDialog: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { pairType: currentPairType, modal, modalOptions } = useSelector(
    selectPerpetualPage,
  );
  const ammState = usePerpetual_queryAmmState();
  const perpParameters = usePerpetual_queryPerpParameters();
  const traderState = usePerpetual_queryTraderState();
  const trade = useMemo(
    () => (isPerpetualTrade(modalOptions) ? modalOptions : undefined),
    [modalOptions],
  );
  const pair = useMemo(
    () => trade?.pairType && PerpetualPairDictionary.get(trade.pairType),
    [trade],
  );
  const { available } = usePerpetual_accountBalance(
    trade?.pairType || currentPairType,
  );

  const [mode, setMode] = useState(EditMarginDialogMode.increase);
  const onSelectIncrease = useCallback(
    () => setMode(EditMarginDialogMode.increase),
    [],
  );
  const onSelectDecrease = useCallback(
    () => setMode(EditMarginDialogMode.decrease),
    [],
  );

  const [margin, setMargin] = useState('0');
  const [changedTrade, setChangedTrade] = useState(trade);

  const onClose = useCallback(
    () => dispatch(actions.setModal(PerpetualPageModals.NONE)),
    [dispatch],
  );

  const onSubmit = useCallback(
    () =>
      // TODO: implement review and excecution for EditMarginDialog
      dispatch(
        actions.setModal(PerpetualPageModals.TRADE_REVIEW, changedTrade),
      ),
    [dispatch, changedTrade],
  );

  const [maxAmount, maxAmountWei] = useMemo(() => {
    if (mode === EditMarginDialogMode.increase) {
      // Fees don't need to be subtracted, since Collateral is not paid with the Network Token
      return [Number(fromWei(available)), available];
    } else {
      const requiredMargin =
        (Math.abs(Number(fromWei(trade?.amount || '0'))) *
          getBase2CollateralFX(ammState, true)) /
        (pair?.config.leverage.max || 1);
      const maxAmount = traderState.availableCashCC - requiredMargin;
      return [maxAmount, toWei(maxAmount.toPrecision(8))];
    }
  }, [
    mode,
    available,
    trade?.amount,
    pair,
    ammState,
    traderState.availableCashCC,
  ]);

  const onChangeMargin = useCallback(
    (margin?: string) =>
      setMargin(currentMargin =>
        Math.max(
          0,
          Math.min(maxAmount, margin ? Number(margin) : Number(currentMargin)),
        ).toString(),
      ),
    [maxAmount],
  );

  const liquidationPrice = useMemo(
    () =>
      calculateApproxLiquidationPrice(
        changedTrade ? Number(fromWei(changedTrade.amount)) : 0,
        Number(margin),
        ammState,
        perpParameters,
      ),
    [changedTrade, margin, ammState, perpParameters],
  );

  useEffect(() => setChangedTrade(trade), [trade]);

  useEffect(() => onChangeMargin(), [onChangeMargin]);

  useEffect(() => {
    const newMargin =
      traderState.availableCashCC +
      (mode === EditMarginDialogMode.increase ? 1 : -1) * Number(margin);

    const leverage = calculateLeverageForMargin(
      newMargin,
      traderState,
      ammState,
    );

    setChangedTrade(
      changedTrade => changedTrade && { ...changedTrade, leverage },
    );
  }, [mode, margin, traderState, ammState]);

  return (
    <Dialog
      isOpen={modal === PerpetualPageModals.EDIT_MARGIN}
      onClose={onClose}
    >
      <h1>{t(translations.perpetualPage.editLeverage.title)}</h1>
      {trade && pair && (
        <div className="tw-mw-340 tw-mx-auto">
          <TradeDetails
            className="tw-mw-340 tw-mx-auto tw-mb-4"
            trade={trade}
            pair={pair}
          />
          <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-mb-5">
            <button
              className={classNames(
                'tw-w-full tw-h-8 tw-font-semibold tw-text-sm tw-rounded-l-lg tw-border tw-border-secondary tw-transition-colors tw-duration-300',
                mode === EditMarginDialogMode.increase
                  ? 'tw-text-white tw-bg-secondary-50'
                  : 'tw-text-gray-5 tw-bg-transparent hover:tw-text-white hover:tw-bg-secondary-50',
              )}
              onClick={onSelectIncrease}
              // disabled={!validate || !connected || openTradesLocked}
            >
              {t(translations.perpetualPage.editMargin.increase)}
            </button>
            <button
              className={classNames(
                'tw-w-full tw-h-8 tw-font-semibold tw-text-sm tw-rounded-r-lg tw-border tw-border-secondary tw-transition-colors tw-duration-300',
                mode === EditMarginDialogMode.decrease
                  ? 'tw-text-white tw-bg-secondary-50'
                  : 'tw-text-gray-5 tw-bg-transparent hover:tw-text-white hover:tw-bg-secondary-50',
              )}
              onClick={onSelectDecrease}
            >
              {t(translations.perpetualPage.editMargin.decrease)}
            </button>
          </div>
          <div className="tw-mb-4 tw-text-sm">
            <label>
              {mode === EditMarginDialogMode.increase
                ? t(translations.perpetualPage.editMargin.increaseLabel)
                : t(translations.perpetualPage.editMargin.decreaseLabel)}
            </label>
            <AmountInput
              value={margin}
              maxAmount={maxAmountWei}
              assetString={pair.collateralAsset}
              decimalPrecision={6}
              step={0.0001}
              onChange={onChangeMargin}
            />
          </div>
          <LeverageViewer
            className="tw-mt-3 tw-mb-4"
            label={t(translations.perpetualPage.tradeForm.labels.leverage)}
            min={pair.config.leverage.min}
            max={pair.config.leverage.max}
            value={changedTrade?.leverage || 0}
            valueLabel={
              changedTrade && `${toNumberFormat(changedTrade.leverage, 2)}x`
            }
          />
          <div className="tw-flex tw-flex-row tw-justify-between tw-px-6 tw-py-1 tw-mb-8 tw-text-xs tw-font-medium tw-border tw-border-gray-5 tw-rounded-lg">
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
          <button
            className="tw-w-full tw-min-h-10 tw-p-2 tw-text-lg tw-text-primary tw-font-medium tw-border tw-border-primary tw-bg-primary-10 tw-rounded-lg tw-transition-colors tw-duration-300 hover:tw-bg-primary-25"
            onClick={onSubmit}
          >
            {t(translations.perpetualPage.editMargin.button)}
          </button>
        </div>
      )}
    </Dialog>
  );
};

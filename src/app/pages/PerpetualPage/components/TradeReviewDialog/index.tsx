import React, { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { translations } from '../../../../../locales/i18n';
import { Dialog } from '../../../../containers/Dialog';
import { selectPerpetualPage } from '../../selectors';
import { actions } from '../../slice';
import { isPerpetualTrade, PerpetualPageModals } from '../../types';
import { usePerpetual_openTrade } from '../../hooks/usePerpetual_openTrade';
import styles from './index.module.scss';
import classNames from 'classnames';
import { TradingPosition } from 'types/trading-position';
import { fromWei } from 'web3-utils';
import { usePerpetual_queryAmmState } from '../../hooks/usePerpetual_queryAmmState';
import { usePerpetual_queryPerpParameters } from '../../hooks/usePerpetual_queryPerpParameters';
import { getMidPrice } from '../../utils/perpUtils';
import { toNumberFormat } from 'utils/display-text/format';

const getTradePosition = (tradePosition: TradingPosition) =>
  tradePosition === TradingPosition.LONG ? (
    <Trans i18nKey={translations.perpetualPage.reviewTrade.buy} />
  ) : (
    <Trans i18nKey={translations.perpetualPage.reviewTrade.sell} />
  );

export const TradeReviewDialog: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { modal, modalOptions } = useSelector(selectPerpetualPage);

  const ammState = usePerpetual_queryAmmState();
  const perpParameters = usePerpetual_queryPerpParameters();

  const { trade: openTrade } = usePerpetual_openTrade();

  const trade = useMemo(
    () => (isPerpetualTrade(modalOptions) ? modalOptions : undefined),
    [modalOptions],
  );

  const onClose = useCallback(
    () => dispatch(actions.setModal(PerpetualPageModals.NONE)),
    [dispatch],
  );

  const onSubmit = useCallback(
    () =>
      trade &&
      openTrade(
        false,
        trade?.amount,
        trade.leverage,
        trade.slippage,
        trade.position,
      ),
    [openTrade, trade],
  );

  const midPrice = useMemo(() => getMidPrice(perpParameters, ammState), [
    perpParameters,
    ammState,
  ]);

  if (!trade) {
    return null;
  }

  return (
    <Dialog
      isOpen={modal === PerpetualPageModals.TRADE_REVIEW}
      onClose={onClose}
    >
      <h1>{t(translations.perpetualPage.reviewTrade.title)}</h1>
      <div className={styles.contentWrapper}>
        <div className={styles.importantInfo}>
          <div className={styles.orderAction}>
            {trade?.leverage}x{' '}
            {t(translations.perpetualPage.reviewTrade.market)}{' '}
            {getTradePosition(trade?.position)}
          </div>
          <div className={styles.orderActionAdditionalInfo}>
            {fromWei(trade?.amount)} BTC @ ≥ {toNumberFormat(midPrice, 2)} USD
          </div>
        </div>

        <div className={classNames(styles.importantInfo, 'tw-mt-4')}>
          <div className={styles.tradingFeeWrapper}>
            <span className="tw-text-gray-10 tw-font-light">
              {t(translations.perpetualPage.tradeForm.labels.tradingFee)}
            </span>
            <span className="tradingFeeValue">0.0004 BTC</span>
          </div>
        </div>

        <div className={styles.positionDetailsTitle}>New Position Details</div>

        <div className={styles.positionInfo}>
          <div className={styles.positionInfoRow}>
            <span className="tw-text-gray-10 tw-font-light">
              {t(translations.perpetualPage.reviewTrade.labels.positionSize)}
            </span>
            <span className={styles.positionSize}>
              +{fromWei(trade?.amount)} BTC
            </span>
          </div>

          <div className={classNames(styles.positionInfoRow, 'tw-mt-2')}>
            <span className="tw-text-gray-10 tw-font-light">
              {t(translations.perpetualPage.reviewTrade.labels.margin)}
            </span>
            <span>0.006 BTC</span>
          </div>

          <div className={classNames(styles.positionInfoRow, 'tw-mt-2')}>
            <span className="tw-text-gray-10 tw-font-light">
              {t(translations.perpetualPage.reviewTrade.labels.leverage)}
            </span>
            <span>{trade.leverage}x</span>
          </div>

          <div className={classNames(styles.positionInfoRow, 'tw-mt-2')}>
            <span className="tw-text-gray-10 tw-font-light">
              {t(translations.perpetualPage.reviewTrade.labels.entryPrice)}
            </span>
            <span>
              {trade.position === TradingPosition.LONG ? '≥' : '≤'}{' '}
              {toNumberFormat(midPrice, 2)}
            </span>
          </div>

          <div className={classNames(styles.positionInfoRow, 'tw-mt-2')}>
            <span className="tw-text-gray-10 tw-font-light">
              {t(
                translations.perpetualPage.reviewTrade.labels.liquidationPrice,
              )}
            </span>
            <span>91 000 USD</span>
          </div>
        </div>

        <div className="tw-flex tw-justify-center">
          <button className={styles.confirmButton} onClick={onSubmit}>
            Confirm
          </button>
        </div>
      </div>
    </Dialog>
  );
};
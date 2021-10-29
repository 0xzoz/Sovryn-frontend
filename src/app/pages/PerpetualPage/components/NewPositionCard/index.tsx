import { useWalletContext } from '@sovryn/react-wallet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { translations } from '../../../../../locales/i18n';
import { TradingPosition } from '../../../../../types/trading-position';
import {
  PerpetualPairDictionary,
  PerpetualPairType,
} from '../../../../../utils/dictionaries/perpetual-pair-dictionary';
import { selectPerpetualPage } from '../../selectors';
import { actions } from '../../slice';
import { DataCard } from '../DataCard';
import {
  PerpetualPageModals,
  PerpetualTrade,
  PerpetualTradeType,
} from '../../types';
import { TransitionSteps } from '../../../../containers/TransitionSteps';
import { TransitionAnimation } from '../../../../containers/TransitionContainer';
import { Asset, Nullable } from '../../../../../types';
import { NewPositionCardContextType, NewPositionCardStep } from './types';
import { SlippageFormStep } from './components/SlippageFormStep';
import { TradeFormStep } from './components/TradeFormStep';
import { ConnectFormStep } from './components/ConnectFormStep';
import { noop } from '../../../../constants';
import { PERPETUAL_SLIPPAGE_DEFAULT } from '../..';

export const NewPositionCardContext = React.createContext<
  NewPositionCardContextType
>({
  trade: {
    pairType: PerpetualPairType.BTCUSD,
    collateral: Asset.PERPETUALS,
    position: TradingPosition.LONG,
    tradeType: PerpetualTradeType.MARKET,
    amount: '0',
    limit: '0',
    leverage: 1,
    slippage: PERPETUAL_SLIPPAGE_DEFAULT,
  },
  onChangeTrade: noop,
  onSubmit: noop,
});

const StepComponents = {
  [NewPositionCardStep.unconnected]: ConnectFormStep,
  [NewPositionCardStep.trade]: TradeFormStep,
  [NewPositionCardStep.slippage]: SlippageFormStep,
};

type NewPositionCardProps = {
  /** balance as wei string */
  balance: Nullable<string>;
};

export const NewPositionCard: React.FC<NewPositionCardProps> = ({
  balance,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { connected } = useWalletContext();
  const { pairType, collateral } = useSelector(selectPerpetualPage);

  const [trade, setTrade] = useState<PerpetualTrade>({
    pairType,
    collateral,
    position: TradingPosition.LONG,
    tradeType: PerpetualTradeType.MARKET,
    amount: '0',
    limit: '0',
    leverage: 1,
    slippage: PERPETUAL_SLIPPAGE_DEFAULT,
  });

  const onSubmit = useCallback(
    () => dispatch(actions.setModal(PerpetualPageModals.TRADE_REVIEW, trade)),
    [dispatch, trade],
  );

  const pair = useMemo(() => PerpetualPairDictionary.get(pairType), [pairType]);

  useEffect(() => {
    if (!pair.collaterals.includes(collateral)) {
      dispatch(actions.setCollateral(pair.collaterals[0]));
    }
  }, [pair.collaterals, collateral, dispatch]);

  const stepProps: NewPositionCardContextType = useMemo(
    () => ({
      trade,
      onSubmit,
      onChangeTrade: setTrade,
    }),
    [trade, onSubmit],
  );

  return (
    <DataCard
      title={t(translations.perpetualPage.tradeForm.titles.order)}
      className="tw-relative"
      hasPadding={false}
    >
      <NewPositionCardContext.Provider value={stepProps}>
        <TransitionSteps<NewPositionCardStep>
          classNameOuter="tw-h-full tw-min-h-max"
          classNameInner="tw-p-4 tw-h-full tw-min-h-max"
          active={
            connected
              ? NewPositionCardStep.trade
              : NewPositionCardStep.unconnected
          }
          defaultAnimation={TransitionAnimation.slideLeft}
          steps={StepComponents}
        />
      </NewPositionCardContext.Provider>
    </DataCard>
  );
};

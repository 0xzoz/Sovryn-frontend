import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { useSelector } from 'react-redux';
import { useFetch } from 'app/hooks/useFetch';
import { PoolData } from 'app/components/Arbitrage/models/pool-data';
import { backendUrl, currentChainId } from 'utils/classifiers';
import { assetByTokenAddress } from 'utils/blockchain/contract-helpers';
import { selectWalletProvider } from 'app/containers/WalletProvider/selectors';
import { fixNumber } from 'utils/helpers';
import { bignumber } from 'mathjs';
import { Opportunity } from 'app/components/Arbitrage/models/opportunity';
import { Asset } from 'types';
import { StyledImage } from './styled';
import { Icon, Popover } from '@blueprintjs/core';
import { AssetsDictionary } from 'utils/dictionaries/assets-dictionary';
import { toNumberFormat } from 'utils/display-text/format';
import { AssetSymbolRenderer } from 'app/components/AssetSymbolRenderer';
import { ActionButton } from 'app/components/Form/ActionButton';
import { useHistory } from 'react-router-dom';
import { isValidArbitrage } from 'app/components/Arbitrage/Arbitrage';
import cn from 'classnames';

export const ArbitrageOpportunity: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { assetRates } = useSelector(selectWalletProvider);

  const { value: data } = useFetch<PoolData>(
    backendUrl[currentChainId] + '/amm/arbitrage',
    {},
  );

  const opportunityArray = useMemo(
    () =>
      Object.values(data)
        .filter(isValidArbitrage)
        .map(item => {
          const toToken = assetByTokenAddress(item.rateToBalance.to);
          const rate = assetRates.find(
            item => item.source === toToken && item.target === Asset.USDT,
          );
          return {
            fromToken: assetByTokenAddress(item.rateToBalance.from),
            toToken,
            fromAmount: item.rateToBalance.amount,
            toAmount: item.rateToBalance.rate,
            earn: item.rateToBalance.earn,
            earnUsd: rate
              ? Number(
                  bignumber(fixNumber(rate.value.rate))
                    .mul(item.rateToBalance.earn)
                    .div(rate.value.precision)
                    .toFixed(18),
                )
              : 0,
          };
        })
        .sort((a, b) => b.earnUsd - a.earnUsd) as Opportunity[],
    [data, assetRates],
  );

  return (
    <div>
      <div className="tw-text-base tw-flex tw-items-center tw-gap-3 tw-tracking-wider">
        {t(translations.landingPage.arbitrageOpportunity.title)}
        <div className="tw-flex-1 tw-h-px tw-bg-white" />
      </div>
      <div className="tw-flex tw-flex-col tw-mt-5">
        {!opportunityArray.length && (
          <>
            <div className="tw-flex tw-items-center tw-my-4" />
            <div className="tw-flex tw-items-center tw-my-4 tw-text-center tw-w-full">
              There are currently no arbitrage opportunities…
            </div>
            <div className="tw-flex tw-items-center tw-my-4" />
          </>
        )}
        {opportunityArray.map((opportunity, i) => {
          return (
            <div
              key={opportunity.fromToken + opportunity.toToken}
              className={cn(
                'tw-flex tw-items-center tw-h-16 tw-px-5 tw-rounded-10px',
                {
                  'tw-bg-gray-100': i % 2 === 0,
                },
              )}
            >
              <div className="tw-rounded-full tw-z-10">
                <StyledImage
                  src={AssetsDictionary.get(opportunity.fromToken).logoSvg}
                />
              </div>
              <div className="tw-rounded-full tw--ml-3">
                <StyledImage
                  src={AssetsDictionary.get(opportunity.toToken).logoSvg}
                />
              </div>

              <div className="tw-font-light text-white tw-ml-2.5 tw-flex-1">
                {t(translations.landingPage.arbitrageOpportunity.swapUp)}{' '}
                <span>
                  {toNumberFormat(opportunity.fromAmount, 6)}{' '}
                  <AssetSymbolRenderer asset={opportunity.fromToken} />
                </span>{' '}
                {t(translations.landingPage.arbitrageOpportunity.for)}{' '}
                <span>
                  {toNumberFormat(opportunity.toAmount, 6)}{' '}
                  <AssetSymbolRenderer asset={opportunity.toToken} />
                </span>
              </div>
              <div className="tw-flex tw-items-center">
                <Popover
                  content={
                    <div className="px-5 py-4 font-weight-light">
                      <p>
                        {t(translations.swapTradeForm.arbitrage.popover_p1, {
                          fromAmount: toNumberFormat(opportunity.fromAmount, 6),
                          fromToken: opportunity.fromToken,
                          toAmount: toNumberFormat(opportunity.toAmount, 6),
                          toToken: opportunity.toToken,
                        })}
                      </p>
                      <p>
                        {t(translations.swapTradeForm.arbitrage.popover_p2, {
                          toToken: opportunity.toToken,
                          earn: toNumberFormat(opportunity.earn, 6),
                        })}
                      </p>
                    </div>
                  }
                  className="tw-ml-2"
                  popoverClassName={'w-50 tw-transform tw-translate-x-full'}
                >
                  <Icon icon={'info-sign'} />
                </Popover>

                <ActionButton
                  className="tw-uppercase tw-ml-2"
                  text={t(translations.landingPage.arbitrageOpportunity.swap)}
                  onClick={() => {
                    history.push({
                      pathname: '/swap',
                      state: {
                        asset: opportunity.fromToken,
                        target: opportunity.toToken,
                      },
                    });
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
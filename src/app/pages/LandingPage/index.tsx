import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from 'app/components/Header';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { TradingVolume } from './components/TradingVolume';
// import { ArbitrageOpportunity } from './components/ArbitrageOpportunity';
import { Banner } from './components/Banner';
import { TotalValueLocked } from './components/TotalValueLocked';
import { Promotions } from './components/Promotions';
import { AmmBalance } from './components/AmmBalance';
import { backendUrl, currentChainId } from 'utils/classifiers';
import { TvlData } from 'app/containers/StatsPage/types';
import axios, { Canceler } from 'axios';
import { useInterval } from 'app/hooks/useInterval';
import { WelcomeTitle } from './styled';
import { LendingStats } from 'app/containers/StatsPage/components/LendingStats';
import { Footer } from 'app/components/Footer';
import babelfishBanner from 'assets/images/banner/babelFish-promo.svg';

const url = backendUrl[currentChainId];

interface ILandingPageProps {
  refreshInterval?: number;
}

export const LandingPage: React.FC<ILandingPageProps> = ({
  refreshInterval = 300000,
}) => {
  const { t } = useTranslation();

  const [tvlLoading, setTvlLoading] = useState(false);
  const [tvlData, setTvlData] = useState<TvlData>();

  const cancelDataRequest = useRef<Canceler>();

  const getTvlData = useCallback(() => {
    setTvlLoading(true);
    cancelDataRequest.current && cancelDataRequest.current();

    const cancelToken = new axios.CancelToken(c => {
      cancelDataRequest.current = c;
    });
    axios
      .get(url + '/tvl', {
        cancelToken,
      })
      .then(res => {
        setTvlData(res.data);
        setTvlLoading(false);
      })
      .catch(e => console.error(e));
  }, []);

  useInterval(() => {
    getTvlData();
  }, refreshInterval);

  useEffect(() => {
    getTvlData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{t(translations.landingPage.meta.title)}</title>
        <meta
          name="description"
          content={t(translations.landingPage.meta.description)}
        />
      </Helmet>
      <Header />
      <div className="container tw-max-w-screen-2xl tw-mx-auto tw-mt-16 tw-px-4 2xl:tw-px-0">
        <div className="tw-tracking-normal">
          <WelcomeTitle>
            {t(translations.landingPage.welcomeTitle)}
          </WelcomeTitle>
        </div>
        <div className="tw-flex tw-flex-col md:tw-flex-row">
          <div className="tw-w-full md:tw-w-7/12">
            <div className="tw-text-base tw-capitalize tw-mt-4 tw-mb-10">
              {t(translations.landingPage.welcomeMessage)}
            </div>
            <TradingVolume
              tvlValueBtc={tvlData?.total_btc}
              tvlValueUsd={tvlData?.total_usd}
              tvlLoading={tvlLoading}
            />
          </div>

          <div className="tw-w-full md:tw-w-5/12">
            {/* <ArbitrageOpportunity /> */}
            <Banner
              title={t(translations.landingPage.banner.originsFish)}
              //remember month starts from 0
              date={Date.UTC(2021, 7, 26, 14, 0)}
              image={babelfishBanner}
              learnLink="https://www.sovryn.app/blog/babelfish-sale-on-origins-1400-UTC-26-08-2021"
              buyLink="/origins"
            />
          </div>
        </div>

        <Promotions />
        <div className="tw-max-w-screen-xl tw-mx-auto">
          <div className="tw-font-semibold tw-mb-8">
            {t(translations.landingPage.lendBorrow)}
          </div>
          <div className="tw-w-full tw-overflow-auto">
            <LendingStats />
          </div>

          <AmmBalance />

          <div className="tw-w-full tw-overflow-auto">
            <TotalValueLocked loading={tvlLoading} data={tvlData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
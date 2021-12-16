import { LootDropColors } from 'app/components/FinanceV2Components/LootDrop/styled';
import { AppMode } from 'types/app-mode';
import { Asset } from 'types/asset';
import { AmmLiquidityPool } from 'utils/models/amm-liquidity-pool';

export const testnetAmm = [
  new AmmLiquidityPool(
    Asset.SOV,
    Asset.RBTC,
    1,
    AppMode.TESTNET,
    '0xaBAABc2191A23D6Bb2cfa973892062c131cb7647',
    '0xdF298421CB18740a7059b0Af532167fAA45e7A98',
  )
    .setLootDropColor(LootDropColors.Purple)
    .setPreviousConverters(['0xaBAABc2191A23D6Bb2cfa973892062c131cb7647']),
  new AmmLiquidityPool(
    Asset.XUSD,
    Asset.RBTC,
    1,
    AppMode.TESTNET,
    '0x9a1aE300b23F4C676186e6d417ac586889aAfF42',
    '0x6601Ccd32342d644282e82Cb05A3Dd88964D18c1',
  )
    .setLootDropColor(LootDropColors.Yellow)
    .setPreviousConverters(['0x9a1aE300b23F4C676186e6d417ac586889aAfF42']),
  new AmmLiquidityPool(
    Asset.FISH,
    Asset.RBTC,
    1,
    AppMode.TESTNET,
    '0x5871040a14331c0f7AB5390A3Df16D271b0936ef',
    '0xe41E262889f89b9a6331680606D9e9AabD01743e',
  ).setPreviousConverters(['0x5871040a14331c0f7AB5390A3Df16D271b0936ef']),
  new AmmLiquidityPool(
    Asset.USDT,
    Asset.RBTC,
    2,
    AppMode.TESTNET,
    '0x133eBE9c8bA524C9B1B601E794dF527f390729bF',
    '0x7274305BB36d66F70cB8824621EC26d52ABe9069',
    '0xfFBBF93Ecd27C8b500Bd35D554802F7F349A1E9B',
  ),
  new AmmLiquidityPool(
    Asset.BNB,
    Asset.RBTC,
    1,
    AppMode.TESTNET,
    '0xA8D7FDd2f67273F178EFe731d4becd38E2A94E11',
    '0xf97A3589c3fE2059fA3AB4819317B77b4BC6c9A8',
  ).setPreviousConverters(['0xA8D7FDd2f67273F178EFe731d4becd38E2A94E11']),
  new AmmLiquidityPool(
    Asset.ETH,
    Asset.RBTC,
    1,
    AppMode.TESTNET,
    '0x4c493276E14791472633B55aaD82E49D28540bC6',
    '0xBb5B900EDa0F1459F582aB2436EA825a927f5bA2',
  )
    .setLootDropColor(LootDropColors.Blue)
    .setPreviousConverters(['0x4c493276E14791472633B55aaD82E49D28540bC6']),
  new AmmLiquidityPool(
    Asset.MOC,
    Asset.RBTC,
    1,
    AppMode.TESTNET,
    '0x3D18E1EC60c9725494252A835593aa90Da777E15',
    '0x6e03DEFD0ae9091Be74f64c8CB9BE319994E5deB',
  )
    .setSovRewards(false)
    .setPreviousConverters(['0x3D18E1EC60c9725494252A835593aa90Da777E15']),
  new AmmLiquidityPool(
    Asset.DOC,
    Asset.RBTC,
    2,
    AppMode.TESTNET,
    '0x497b0517dd24f66c456e93bc0adbb2a2bf159ec4',
    '0x6787161bc4F8d54e6ac6fcB9643Af6f4a12DfF28',
    '0x7F433CC76298bB5099c15C1C7C8f2e89A8370111',
  ),
  new AmmLiquidityPool(
    Asset.BPRO,
    Asset.RBTC,
    2,
    AppMode.TESTNET,
    '0xe4E467D8B5f61b5C83048d857210678eB86730A4',
    '0xdaf6FD8370f5245d98E829c766e008cd39E8F060',
    '0x98e5F39D8C675972A66ea165040Cb81803c440A3',
  ),
  new AmmLiquidityPool(
    Asset.RIF,
    Asset.RBTC,
    1,
    AppMode.TESTNET,
    '0xA82881bceb367f8653559937A6eFBFffBF2E06DD',
    '0x67fAA17ce83b14B2EA0e643A9030B133edD3Cc43',
  ),
];

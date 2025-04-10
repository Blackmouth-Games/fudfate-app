
interface TarotCard {
  id: string;
  name: string;
  image: string;
  description: string;
  deck: 'deck_1' | 'deck_2' | string;
}

const tarotCards: TarotCard[] = [
  {
    id: 'degen',
    name: 'The Degen',
    image: '/img/cards/deck_1/0_TheDegen.png',
    description: 'Represents risk-taking and the pursuit of high-volatility ventures.',
    deck: 'deck_1'
  },
  {
    id: 'miner',
    name: 'The Miner',
    image: '/img/cards/deck_1/1_TheMiner.png',
    description: 'Symbolizes creation, work, and the foundation of blockchain technology.',
    deck: 'deck_1'
  },
  {
    id: 'oracle',
    name: 'The Oracle',
    image: '/img/cards/deck_1/2_TheOracle.png',
    description: 'Represents wisdom, insight, and the bridge between worlds.',
    deck: 'deck_1'
  },
  {
    id: 'whale',
    name: 'The Whale',
    image: '/img/cards/deck_1/3_TheWhale.png',
    description: 'Symbolizes abundance, wealth, and influence in the market.',
    deck: 'deck_1'
  },
  {
    id: 'exchange',
    name: 'The Exchange',
    image: '/img/cards/deck_1/4_TheExchange.png',
    description: 'Represents transactions, trading, and the flow of value.',
    deck: 'deck_1'
  },
  {
    id: 'whitepaper',
    name: 'The White Paper',
    image: '/img/cards/deck_1/5_TheWhitePaper.png',
    description: 'Symbolizes vision, planning, and the blueprint for success.',
    deck: 'deck_1'
  },
  {
    id: 'fork',
    name: 'The Fork',
    image: '/img/cards/deck_1/6_TheFork.png',
    description: 'Represents critical decisions, divergence, and new paths.',
    deck: 'deck_1'
  },
  {
    id: 'launchpad',
    name: 'The Launchpad',
    image: '/img/cards/deck_1/7_TheLaunchpad.png',
    description: 'Symbolizes new beginnings, opportunities, and growth potential.',
    deck: 'deck_1'
  },
  {
    id: 'smartcontract',
    name: 'The Smart Contract',
    image: '/img/cards/deck_1/8_TheSmartContract.png',
    description: 'Represents agreements, commitments, and automated trust.',
    deck: 'deck_1'
  },
  {
    id: 'privatekey',
    name: 'The Private Key',
    image: '/img/cards/deck_1/9_ThePrivateKey.png',
    description: 'Symbolizes security, protection, and self-sovereignty.',
    deck: 'deck_1'
  },
  {
    id: 'airdrop',
    name: 'The Airdrop',
    image: '/img/cards/deck_1/10_TheAirdrop.png',
    description: 'Represents unexpected gains, gifts, and community distribution.',
    deck: 'deck_1'
  },
  {
    id: 'hodl',
    name: 'The HODLer',
    image: '/img/cards/deck_1/11_TheHoldler.png',
    description: 'Symbolizes patience, determination, and long-term vision.',
    deck: 'deck_1'
  },
  {
    id: 'stablecoin',
    name: 'The Stablecoin',
    image: '/img/cards/deck_1/12_TheStablecoin.png',
    description: 'Represents stability, balance, and steady progress.',
    deck: 'deck_1'
  },
  {
    id: 'rugpull',
    name: 'The Rugpull',
    image: '/img/cards/deck_1/13_TheRugpull.png',
    description: 'Symbolizes deception, loss, and cautionary lessons.',
    deck: 'deck_1'
  },
  {
    id: 'wallet',
    name: 'The Wallet',
    image: '/img/cards/deck_1/14_TheWallet.png',
    description: 'Represents identity, ownership, and the gateway to Web3.',
    deck: 'deck_1'
  },
  {
    id: 'fomo',
    name: 'The FOMO',
    image: '/img/cards/deck_1/15_TheFOMO.png',
    description: 'Symbolizes impulsivity, emotional decisions, and market psychology.',
    deck: 'deck_1'
  },
  {
    id: 'hacker',
    name: 'The Hacker',
    image: '/img/cards/deck_1/16_TheHacker.png',
    description: 'Represents challenge, innovation, and breaking boundaries.',
    deck: 'deck_1'
  },
  {
    id: 'nft',
    name: 'The NFT',
    image: '/img/cards/deck_1/17_TheNFT.png',
    description: 'Symbolizes uniqueness, creative value, and digital ownership.',
    deck: 'deck_1'
  },
  {
    id: 'moon',
    name: 'The Moon',
    image: '/img/cards/deck_1/18_TheMoon.png',
    description: 'Represents aspiration, potential, and exponential growth.',
    deck: 'deck_1'
  },
  {
    id: 'memecoin',
    name: 'The Memecoin',
    image: '/img/cards/deck_1/19_TheMemecoin.png',
    description: 'Symbolizes humor, cultural resonance, and viral potential.',
    deck: 'deck_1'
  },
  {
    id: 'halving',
    name: 'The Halving',
    image: '/img/cards/deck_1/20_TheHalving.png',
    description: 'Represents cycles, scarcity, and evolutionary transitions.',
    deck: 'deck_1'
  },
  {
    id: 'dao',
    name: 'The DAO',
    image: '/img/cards/deck_1/21_TheDAO.png',
    description: 'Symbolizes community governance, collective wisdom, and decentralized organization.',
    deck: 'deck_1'
  }
];

export default tarotCards;

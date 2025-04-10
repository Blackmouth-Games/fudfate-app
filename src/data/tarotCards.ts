
interface TarotCard {
  id: string;
  name: string;
  image: string;
  description: string;
  deck: 'deck1' | 'deck2';
}

const tarotCards: TarotCard[] = [
  {
    id: 'degen',
    name: 'The Degen',
    image: '/img/cards/deck1/0_TheDegen.png',
    description: 'Represents risk-taking and the pursuit of high-volatility ventures.',
    deck: 'deck1'
  },
  {
    id: 'miner',
    name: 'The Miner',
    image: '/img/cards/deck1/1_TheMiner.png',
    description: 'Symbolizes creation, work, and the foundation of blockchain technology.',
    deck: 'deck1'
  },
  {
    id: 'oracle',
    name: 'The Oracle',
    image: '/img/cards/deck1/2_TheOracle.png',
    description: 'Represents wisdom, insight, and the bridge between worlds.',
    deck: 'deck1'
  },
  {
    id: 'whale',
    name: 'The Whale',
    image: '/img/cards/deck1/3_TheWhale.png',
    description: 'Symbolizes abundance, wealth, and influence in the market.',
    deck: 'deck1'
  },
  {
    id: 'exchange',
    name: 'The Exchange',
    image: '/img/cards/deck1/4_TheExchange.png',
    description: 'Represents transactions, trading, and the flow of value.',
    deck: 'deck1'
  },
  {
    id: 'whitepaper',
    name: 'The White Paper',
    image: '/img/cards/deck1/5_TheWhitePaper.png',
    description: 'Symbolizes vision, planning, and the blueprint for success.',
    deck: 'deck1'
  },
  {
    id: 'fork',
    name: 'The Fork',
    image: '/img/cards/deck1/6_TheFork.png',
    description: 'Represents critical decisions, divergence, and new paths.',
    deck: 'deck1'
  },
  {
    id: 'launchpad',
    name: 'The Launchpad',
    image: '/img/cards/deck1/7_TheLaunchpad.png',
    description: 'Symbolizes new beginnings, opportunities, and growth potential.',
    deck: 'deck1'
  },
  {
    id: 'smartcontract',
    name: 'The Smart Contract',
    image: '/img/cards/deck1/8_TheSmartContract.png',
    description: 'Represents agreements, commitments, and automated trust.',
    deck: 'deck1'
  },
  {
    id: 'privatekey',
    name: 'The Private Key',
    image: '/img/cards/deck1/9_ThePrivateKey.png',
    description: 'Symbolizes security, protection, and self-sovereignty.',
    deck: 'deck1'
  },
  {
    id: 'airdrop',
    name: 'The Airdrop',
    image: '/img/cards/deck1/10_TheAirdrop.png',
    description: 'Represents unexpected gains, gifts, and community distribution.',
    deck: 'deck1'
  },
  {
    id: 'hodl',
    name: 'The HODLer',
    image: '/img/cards/deck1/11_TheHoldler.png',
    description: 'Symbolizes patience, determination, and long-term vision.',
    deck: 'deck1'
  },
  {
    id: 'stablecoin',
    name: 'The Stablecoin',
    image: '/img/cards/deck1/12_TheStablecoin.png',
    description: 'Represents stability, balance, and steady progress.',
    deck: 'deck1'
  },
  {
    id: 'rugpull',
    name: 'The Rugpull',
    image: '/img/cards/deck1/13_TheRugpull.png',
    description: 'Symbolizes deception, loss, and cautionary lessons.',
    deck: 'deck1'
  },
  {
    id: 'wallet',
    name: 'The Wallet',
    image: '/img/cards/deck1/14_TheWallet.png',
    description: 'Represents identity, ownership, and the gateway to Web3.',
    deck: 'deck1'
  },
  {
    id: 'fomo',
    name: 'The FOMO',
    image: '/img/cards/deck1/15_TheFOMO.png',
    description: 'Symbolizes impulsivity, emotional decisions, and market psychology.',
    deck: 'deck1'
  },
  {
    id: 'hacker',
    name: 'The Hacker',
    image: '/img/cards/deck1/16_TheHacker.png',
    description: 'Represents challenge, innovation, and breaking boundaries.',
    deck: 'deck1'
  },
  {
    id: 'nft',
    name: 'The NFT',
    image: '/img/cards/deck1/17_TheNFT.png',
    description: 'Symbolizes uniqueness, creative value, and digital ownership.',
    deck: 'deck1'
  },
  {
    id: 'moon',
    name: 'The Moon',
    image: '/img/cards/deck1/18_TheMoon.png',
    description: 'Represents aspiration, potential, and exponential growth.',
    deck: 'deck1'
  },
  {
    id: 'memecoin',
    name: 'The Memecoin',
    image: '/img/cards/deck1/19_TheMemecoin.png',
    description: 'Symbolizes humor, cultural resonance, and viral potential.',
    deck: 'deck1'
  },
  {
    id: 'halving',
    name: 'The Halving',
    image: '/img/cards/deck1/20_TheHalving.png',
    description: 'Represents cycles, scarcity, and evolutionary transitions.',
    deck: 'deck1'
  },
  {
    id: 'dao',
    name: 'The DAO',
    image: '/img/cards/deck1/21_TheDAO.png',
    description: 'Symbolizes community governance, collective wisdom, and decentralized organization.',
    deck: 'deck1'
  }
];

export default tarotCards;


interface TarotCard {
  id: string;
  name: string;
  image: string;
  description: string;
  deck: 'deck_1' | 'deck_2' | string;
}

const tarotCards: TarotCard[] = [
  // Deck 1 - Crypto-themed cards
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
  },
  
  // Deck 2 - Classic Tarot cards
  {
    id: 'fool',
    name: 'The Fool',
    image: '/img/cards/deck_2/0_the fool.png',
    description: 'Represents new beginnings, innocence, and spontaneity.',
    deck: 'deck_2'
  },
  {
    id: 'magician',
    name: 'The Magician',
    image: '/img/cards/deck_2/1_the magician.png',
    description: 'Symbolizes manifestation, resourcefulness, and inspired action.',
    deck: 'deck_2'
  },
  {
    id: 'highpriestess',
    name: 'The High Priestess',
    image: '/img/cards/deck_2/2_the high priestess.png',
    description: 'Represents intuition, unconscious knowledge, and mystery.',
    deck: 'deck_2'
  },
  {
    id: 'empress',
    name: 'The Empress',
    image: '/img/cards/deck_2/3_the empress.png',
    description: 'Symbolizes abundance, nurturing, and fertility.',
    deck: 'deck_2'
  },
  {
    id: 'emperor',
    name: 'The Emperor',
    image: '/img/cards/deck_2/4_the emperor.png',
    description: 'Represents authority, structure, and control.',
    deck: 'deck_2'
  },
  {
    id: 'hierophant',
    name: 'The Hierophant',
    image: '/img/cards/deck_2/5_the hierophant.png',
    description: 'Symbolizes tradition, conformity, and spiritual wisdom.',
    deck: 'deck_2'
  },
  {
    id: 'lovers',
    name: 'The Lovers',
    image: '/img/cards/deck_2/6_the lovers.png',
    description: 'Represents choices, relationships, and alignment of values.',
    deck: 'deck_2'
  },
  {
    id: 'chariot',
    name: 'The Chariot',
    image: '/img/cards/deck_2/7_the chariot.png',
    description: 'Symbolizes determination, willpower, and victory.',
    deck: 'deck_2'
  },
  {
    id: 'strength',
    name: 'Strength',
    image: '/img/cards/deck_2/8_strength.png',
    description: 'Represents courage, persuasion, and inner strength.',
    deck: 'deck_2'
  },
  {
    id: 'hermit',
    name: 'The Hermit',
    image: '/img/cards/deck_2/9_the hermit.png',
    description: 'Symbolizes introspection, searching for truth, and inner guidance.',
    deck: 'deck_2'
  },
  {
    id: 'wheel',
    name: 'Wheel of Fortune',
    image: '/img/cards/deck_2/10_wheel of fortune.png',
    description: 'Represents cycles, fate, and turning points.',
    deck: 'deck_2'
  },
  {
    id: 'justice',
    name: 'Justice',
    image: '/img/cards/deck_2/11_justice.png',
    description: 'Symbolizes fairness, truth, and law.',
    deck: 'deck_2'
  },
  {
    id: 'hangedman',
    name: 'The Hanged Man',
    image: '/img/cards/deck_2/12_the hanged man.png',
    description: 'Represents surrender, new perspective, and suspension.',
    deck: 'deck_2'
  },
  {
    id: 'death',
    name: 'Death',
    image: '/img/cards/deck_2/13_death.png',
    description: 'Symbolizes endings, change, and transformation.',
    deck: 'deck_2'
  },
  {
    id: 'temperance',
    name: 'Temperance',
    image: '/img/cards/deck_2/14_temperance.png',
    description: 'Represents balance, moderation, and patience.',
    deck: 'deck_2'
  },
  {
    id: 'devil',
    name: 'The Devil',
    image: '/img/cards/deck_2/15_the devil.png',
    description: 'Symbolizes bondage, materialism, and ignorance.',
    deck: 'deck_2'
  },
  {
    id: 'tower',
    name: 'The Tower',
    image: '/img/cards/deck_2/16_the tower.png',
    description: 'Represents sudden change, upheaval, and revelation.',
    deck: 'deck_2'
  },
  {
    id: 'star',
    name: 'The Star',
    image: '/img/cards/deck_2/17_the star.png',
    description: 'Symbolizes hope, faith, and purpose.',
    deck: 'deck_2'
  },
  {
    id: 'moon_deck2',
    name: 'The Moon',
    image: '/img/cards/deck_2/18_the moon.png',
    description: 'Represents illusion, fear, and subconscious.',
    deck: 'deck_2'
  },
  {
    id: 'sun',
    name: 'The Sun',
    image: '/img/cards/deck_2/19_the sun.png',
    description: 'Symbolizes success, joy, and vitality.',
    deck: 'deck_2'
  },
  {
    id: 'judgement',
    name: 'Judgement',
    image: '/img/cards/deck_2/20_judgement.png',
    description: 'Represents rebirth, inner calling, and absolution.',
    deck: 'deck_2'
  },
  {
    id: 'world',
    name: 'The World',
    image: '/img/cards/deck_2/21_the world.png',
    description: 'Symbolizes completion, accomplishment, and fulfillment.',
    deck: 'deck_2'
  }
];

export default tarotCards;

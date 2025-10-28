export interface TriviaItem {
  id: string;
  text: string;
  icon: string;
  category: 'aviation' | 'skymapper' | 'fun' | 'safety';
}

export const triviaData: TriviaItem[] = [
  // Aviation Facts
  {
    id: 'av1',
    text: 'A Boeing 747 uses about 4 liters of fuel per second!',
    icon: '✈️',
    category: 'aviation'
  },
  {
    id: 'av2',
    text: 'The Wright Brothers\' first flight was shorter than a Boeing 747!',
    icon: '🛫',
    category: 'aviation'
  },
  {
    id: 'av3',
    text: 'Pilots and co-pilots eat different meals to avoid food poisoning!',
    icon: '🍽️',
    category: 'aviation'
  },
  {
    id: 'av4',
    text: 'Lightning strikes aircraft ~1 time per 1,000 flight hours!',
    icon: '⚡',
    category: 'aviation'
  },
  {
    id: 'av5',
    text: 'The busiest airspace is over Atlanta with 2,700+ daily flights!',
    icon: '🏢',
    category: 'aviation'
  },
  {
    id: 'av6',
    text: 'VFR pilots must stay 1000ft above populated areas!',
    icon: '🏘️',
    category: 'aviation'
  },
  {
    id: 'av7',
    text: 'Class G airspace extends from surface to 14,500ft AGL!',
    icon: '🌍',
    category: 'aviation'
  },
  {
    id: 'av8',
    text: 'A Cessna 172 cruises at about 110 knots!',
    icon: '🛩️',
    category: 'aviation'
  },

  // Skymapper Stats
  {
    id: 'sm1',
    text: 'Over 15,000 routes planned on Skymapper this month!',
    icon: '📊',
    category: 'skymapper'
  },
  {
    id: 'sm2',
    text: 'Skymapper covers 50+ countries with aviation data!',
    icon: '🌎',
    category: 'skymapper'
  },
  {
    id: 'sm3',
    text: 'Average flight plan takes just 3 minutes to create!',
    icon: '⏱️',
    category: 'skymapper'
  },
  {
    id: 'sm4',
    text: 'Skymapper has prevented 200+ airspace violations!',
    icon: '🛡️',
    category: 'skymapper'
  },
  {
    id: 'sm5',
    text: 'Most popular route: KPAO to KHAF (SF Bay Area)!',
    icon: '🌉',
    category: 'skymapper'
  },
  {
    id: 'sm6',
    text: 'Users save an average of 15 minutes per flight plan!',
    icon: '💾',
    category: 'skymapper'
  },

  // Fun Facts
  {
    id: 'fn1',
    text: 'Airplane food tastes bland because altitude affects taste buds!',
    icon: '👅',
    category: 'fun'
  },
  {
    id: 'fn2',
    text: 'The Concorde was faster than a rifle bullet!',
    icon: '🚀',
    category: 'fun'
  },
  {
    id: 'fn3',
    text: 'Oxygen masks only provide 15 minutes of oxygen!',
    icon: '😷',
    category: 'fun'
  },
  {
    id: 'fn4',
    text: 'The black box is actually bright orange!',
    icon: '📦',
    category: 'fun'
  },
  {
    id: 'fn5',
    text: 'Airplane tires are designed to land at 170+ mph!',
    icon: '🛞',
    category: 'fun'
  },

  // Safety Tips
  {
    id: 'sf1',
    text: 'Always check NOTAMS before departure!',
    icon: '📋',
    category: 'safety'
  },
  {
    id: 'sf2',
    text: 'VFR minimums: 3 miles visibility, clear of clouds!',
    icon: '👁️',
    category: 'safety'
  },
  {
    id: 'sf3',
    text: 'File a flight plan - it could save your life!',
    icon: '📝',
    category: 'safety'
  },
  {
    id: 'sf4',
    text: 'Pre-flight inspection prevents 90% of mechanical issues!',
    icon: '🔧',
    category: 'safety'
  },
  {
    id: 'sf5',
    text: 'Know your emergency frequencies: 121.5 and 243.0!',
    icon: '📻',
    category: 'safety'
  }
];

export const getCategoryColor = (category: TriviaItem['category']): string => {
  switch (category) {
    case 'aviation':
      return 'from-blue-500 to-blue-600';
    case 'skymapper':
      return 'from-green-500 to-green-600';
    case 'fun':
      return 'from-purple-500 to-purple-600';
    case 'safety':
      return 'from-red-500 to-red-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export const getRandomTrivia = (): TriviaItem => {
  const randomIndex = Math.floor(Math.random() * triviaData.length);
  return triviaData[randomIndex];
};

export const getTriviaByCategory = (category: TriviaItem['category']): TriviaItem[] => {
  return triviaData.filter(item => item.category === category);
};
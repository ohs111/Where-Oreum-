
export interface Oreum {
  id: string;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  difficultyLabel?: '상' | '중' | '하';
  difficultyLabel_en?: 'High' | 'Mid' | 'Low';
  height: number;
  location: string;
  location_en: string;
  evi: number;
  hikerCount: number;
  imageUrl: string;
  tags: string[];
  tags_en: string[];
  pathDescription: string;
  pathDescription_en: string;
  estimatedTime: number;
  recommendedSeason: string;
  recommendedSeason_en: string;
}

export interface ClimbSession {
  isActive: boolean;
  targetOreum: Oreum | null;
  startTime: number | null;
  endTime: number | null;
  currentLat: number | null;
  currentLng: number | null;
  distanceToSummit: number; // 미터 단위
  isCompleted: boolean;
}

export interface RecommendationResponse {
  suggestedOreums: {
    name: string;
    reason: string;
    tips: string;
    difficulty: string;
    estimatedTime: string;
  }[];
  satelliteSummary: string;
}

export interface PurchasedCoupon {
  id: string;
  instanceId: number;
}


export interface Oreum {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  difficultyLabel?: '상' | '중' | '하';
  height: number;
  location: string;
  evi: number;
  hikerCount: number;
  imageUrl: string;
  tags: string[];
  pathDescription: string;
  estimatedTime: number;
  recommendedSeason: string;
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

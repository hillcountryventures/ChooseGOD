// Prayer request types
export type PrayerStatus = 'active' | 'answered' | 'ongoing';

export interface PrayerRequest {
  id: string;
  userId: string;
  circleId?: string;
  request: string;
  scriptureAnchor?: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
  };
  status: PrayerStatus;
  answeredAt?: Date;
  answeredReflection?: string;
  createdAt: Date;
}

// Prayer circle (group)
export interface PrayerCircle {
  id: string;
  name: string;
  createdBy: string;
  inviteCode: string;
  memberCount?: number;
  createdAt: Date;
}

// Circle member
export interface CircleMember {
  circleId: string;
  userId: string;
  displayName?: string;
  joinedAt: Date;
}

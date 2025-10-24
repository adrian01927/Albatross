
export interface Golfer {
  id: string;
  name: string;
  age: number;
  bio: string;
  handicap: number;
  experience: string;
  typicalCourse: string;
  location: string;
  photo: string;
  interests: string[];
  playingStyle?: string;
  favoriteCourse?: string;
}

export interface Match {
  id: string;
  golferId: string;
  golfer: Golfer;
  matchedAt: Date;
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

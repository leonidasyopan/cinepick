
import React from 'react';
import { CryIcon, LaughIcon, WonderIcon, UserIcon, UsersIcon, HeartIcon, FamilyIcon } from '../../components/icons/index';
import type { RefinementPair } from './types';

export const MOODS = [
  { id: 'Crying', labelKey: 'moods.Crying.label', icon: <CryIcon /> },
  { id: 'Laughing', labelKey: 'moods.Laughing.label', icon: <LaughIcon /> },
  { id: 'Wondering', labelKey: 'moods.Wondering.label', icon: <WonderIcon /> },
];

export const SUB_MOODS: Record<string, { id: string; labelKey: string }[]> = {
  Crying: [
    { id: 'cathartic', labelKey: 'moods.Crying.subMoods.cathartic' },
    { id: 'heartwarming', labelKey: 'moods.Crying.subMoods.heartwarming' },
    { id: 'tragic', labelKey: 'moods.Crying.subMoods.tragic' },
  ],
  Laughing: [
    { id: 'light', labelKey: 'moods.Laughing.subMoods.light' },
    { id: 'witty', labelKey: 'moods.Laughing.subMoods.witty' },
    { id: 'absurd', labelKey: 'moods.Laughing.subMoods.absurd' },
  ],
  Wondering: [
    { id: 'mindbending', labelKey: 'moods.Wondering.subMoods.mindbending' },
    { id: 'epic', labelKey: 'moods.Wondering.subMoods.epic' },
    { id: 'documentary', labelKey: 'moods.Wondering.subMoods.documentary' },
  ],
};

export const OCCASIONS = [
  { id: 'solo', labelKey: 'occasions.solo', icon: <UserIcon /> },
  { id: 'friends', labelKey: 'occasions.friends', icon: <UsersIcon /> },
  { id: 'date', labelKey: 'occasions.date', icon: <HeartIcon /> },
  { id: 'family', labelKey: 'occasions.family', icon: <FamilyIcon /> },
];

export const DETAILED_GENRE_REFINEMENTS: Record<string, Record<string, Record<string, RefinementPair[]>>> = {
  "Laughing": {
    "light": {
      "solo": [
        { optionA: "refinements.Laughing.light.solo.0.optionA", optionB: "refinements.Laughing.light.solo.0.optionB", description: "refinements.Laughing.light.solo.0.description" },
        { optionA: "refinements.Laughing.light.solo.1.optionA", optionB: "refinements.Laughing.light.solo.1.optionB", description: "refinements.Laughing.light.solo.1.description" },
        { optionA: "refinements.Laughing.light.solo.2.optionA", optionB: "refinements.Laughing.light.solo.2.optionB", description: "refinements.Laughing.light.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Laughing.light.friends.0.optionA", optionB: "refinements.Laughing.light.friends.0.optionB", description: "refinements.Laughing.light.friends.0.description" },
        { optionA: "refinements.Laughing.light.friends.1.optionA", optionB: "refinements.Laughing.light.friends.1.optionB", description: "refinements.Laughing.light.friends.1.description" },
        { optionA: "refinements.Laughing.light.friends.2.optionA", optionB: "refinements.Laughing.light.friends.2.optionB", description: "refinements.Laughing.light.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Laughing.light.date.0.optionA", optionB: "refinements.Laughing.light.date.0.optionB", description: "refinements.Laughing.light.date.0.description" },
        { optionA: "refinements.Laughing.light.date.1.optionA", optionB: "refinements.Laughing.light.date.1.optionB", description: "refinements.Laughing.light.date.1.description" },
        { optionA: "refinements.Laughing.light.date.2.optionA", optionB: "refinements.Laughing.light.date.2.optionB", description: "refinements.Laughing.light.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Laughing.light.family.0.optionA", optionB: "refinements.Laughing.light.family.0.optionB", description: "refinements.Laughing.light.family.0.description" },
        { optionA: "refinements.Laughing.light.family.1.optionA", optionB: "refinements.Laughing.light.family.1.optionB", description: "refinements.Laughing.light.family.1.description" },
        { optionA: "refinements.Laughing.light.family.2.optionA", optionB: "refinements.Laughing.light.family.2.optionB", description: "refinements.Laughing.light.family.2.description" },
      ]
    },
    "witty": {
      "solo": [
        { optionA: "refinements.Laughing.witty.solo.0.optionA", optionB: "refinements.Laughing.witty.solo.0.optionB", description: "refinements.Laughing.witty.solo.0.description" },
        { optionA: "refinements.Laughing.witty.solo.1.optionA", optionB: "refinements.Laughing.witty.solo.1.optionB", description: "refinements.Laughing.witty.solo.1.description" },
        { optionA: "refinements.Laughing.witty.solo.2.optionA", optionB: "refinements.Laughing.witty.solo.2.optionB", description: "refinements.Laughing.witty.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Laughing.witty.friends.0.optionA", optionB: "refinements.Laughing.witty.friends.0.optionB", description: "refinements.Laughing.witty.friends.0.description" },
        { optionA: "refinements.Laughing.witty.friends.1.optionA", optionB: "refinements.Laughing.witty.friends.1.optionB", description: "refinements.Laughing.witty.friends.1.description" },
        { optionA: "refinements.Laughing.witty.friends.2.optionA", optionB: "refinements.Laughing.witty.friends.2.optionB", description: "refinements.Laughing.witty.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Laughing.witty.date.0.optionA", optionB: "refinements.Laughing.witty.date.0.optionB", description: "refinements.Laughing.witty.date.0.description" },
        { optionA: "refinements.Laughing.witty.date.1.optionA", optionB: "refinements.Laughing.witty.date.1.optionB", description: "refinements.Laughing.witty.date.1.description" },
        { optionA: "refinements.Laughing.witty.date.2.optionA", optionB: "refinements.Laughing.witty.date.2.optionB", description: "refinements.Laughing.witty.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Laughing.witty.family.0.optionA", optionB: "refinements.Laughing.witty.family.0.optionB", description: "refinements.Laughing.witty.family.0.description" },
        { optionA: "refinements.Laughing.witty.family.1.optionA", optionB: "refinements.Laughing.witty.family.1.optionB", description: "refinements.Laughing.witty.family.1.description" },
        { optionA: "refinements.Laughing.witty.family.2.optionA", optionB: "refinements.Laughing.witty.family.2.optionB", description: "refinements.Laughing.witty.family.2.description" },
      ]
    },
    "absurd": {
      "solo": [
        { optionA: "refinements.Laughing.absurd.solo.0.optionA", optionB: "refinements.Laughing.absurd.solo.0.optionB", description: "refinements.Laughing.absurd.solo.0.description" },
        { optionA: "refinements.Laughing.absurd.solo.1.optionA", optionB: "refinements.Laughing.absurd.solo.1.optionB", description: "refinements.Laughing.absurd.solo.1.description" },
        { optionA: "refinements.Laughing.absurd.solo.2.optionA", optionB: "refinements.Laughing.absurd.solo.2.optionB", description: "refinements.Laughing.absurd.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Laughing.absurd.friends.0.optionA", optionB: "refinements.Laughing.absurd.friends.0.optionB", description: "refinements.Laughing.absurd.friends.0.description" },
        { optionA: "refinements.Laughing.absurd.friends.1.optionA", optionB: "refinements.Laughing.absurd.friends.1.optionB", description: "refinements.Laughing.absurd.friends.1.description" },
        { optionA: "refinements.Laughing.absurd.friends.2.optionA", optionB: "refinements.Laughing.absurd.friends.2.optionB", description: "refinements.Laughing.absurd.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Laughing.absurd.date.0.optionA", optionB: "refinements.Laughing.absurd.date.0.optionB", description: "refinements.Laughing.absurd.date.0.description" },
        { optionA: "refinements.Laughing.absurd.date.1.optionA", optionB: "refinements.Laughing.absurd.date.1.optionB", description: "refinements.Laughing.absurd.date.1.description" },
        { optionA: "refinements.Laughing.absurd.date.2.optionA", optionB: "refinements.Laughing.absurd.date.2.optionB", description: "refinements.Laughing.absurd.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Laughing.absurd.family.0.optionA", optionB: "refinements.Laughing.absurd.family.0.optionB", description: "refinements.Laughing.absurd.family.0.description" },
        { optionA: "refinements.Laughing.absurd.family.1.optionA", optionB: "refinements.Laughing.absurd.family.1.optionB", description: "refinements.Laughing.absurd.family.1.description" },
        { optionA: "refinements.Laughing.absurd.family.2.optionA", optionB: "refinements.Laughing.absurd.family.2.optionB", description: "refinements.Laughing.absurd.family.2.description" },
      ]
    }
  },
  "Crying": {
    "cathartic": {
      "solo": [
        { optionA: "refinements.Crying.cathartic.solo.0.optionA", optionB: "refinements.Crying.cathartic.solo.0.optionB", description: "refinements.Crying.cathartic.solo.0.description" },
        { optionA: "refinements.Crying.cathartic.solo.1.optionA", optionB: "refinements.Crying.cathartic.solo.1.optionB", description: "refinements.Crying.cathartic.solo.1.description" },
        { optionA: "refinements.Crying.cathartic.solo.2.optionA", optionB: "refinements.Crying.cathartic.solo.2.optionB", description: "refinements.Crying.cathartic.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Crying.cathartic.friends.0.optionA", optionB: "refinements.Crying.cathartic.friends.0.optionB", description: "refinements.Crying.cathartic.friends.0.description" },
        { optionA: "refinements.Crying.cathartic.friends.1.optionA", optionB: "refinements.Crying.cathartic.friends.1.optionB", description: "refinements.Crying.cathartic.friends.1.description" },
        { optionA: "refinements.Crying.cathartic.friends.2.optionA", optionB: "refinements.Crying.cathartic.friends.2.optionB", description: "refinements.Crying.cathartic.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Crying.cathartic.date.0.optionA", optionB: "refinements.Crying.cathartic.date.0.optionB", description: "refinements.Crying.cathartic.date.0.description" },
        { optionA: "refinements.Crying.cathartic.date.1.optionA", optionB: "refinements.Crying.cathartic.date.1.optionB", description: "refinements.Crying.cathartic.date.1.description" },
        { optionA: "refinements.Crying.cathartic.date.2.optionA", optionB: "refinements.Crying.cathartic.date.2.optionB", description: "refinements.Crying.cathartic.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Crying.cathartic.family.0.optionA", optionB: "refinements.Crying.cathartic.family.0.optionB", description: "refinements.Crying.cathartic.family.0.description" },
        { optionA: "refinements.Crying.cathartic.family.1.optionA", optionB: "refinements.Crying.cathartic.family.1.optionB", description: "refinements.Crying.cathartic.family.1.description" },
        { optionA: "refinements.Crying.cathartic.family.2.optionA", optionB: "refinements.Crying.cathartic.family.2.optionB", description: "refinements.Crying.cathartic.family.2.description" },
      ]
    },
    "heartwarming": {
      "solo": [
        { optionA: "refinements.Crying.heartwarming.solo.0.optionA", optionB: "refinements.Crying.heartwarming.solo.0.optionB", description: "refinements.Crying.heartwarming.solo.0.description" },
        { optionA: "refinements.Crying.heartwarming.solo.1.optionA", optionB: "refinements.Crying.heartwarming.solo.1.optionB", description: "refinements.Crying.heartwarming.solo.1.description" },
        { optionA: "refinements.Crying.heartwarming.solo.2.optionA", optionB: "refinements.Crying.heartwarming.solo.2.optionB", description: "refinements.Crying.heartwarming.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Crying.heartwarming.friends.0.optionA", optionB: "refinements.Crying.heartwarming.friends.0.optionB", description: "refinements.Crying.heartwarming.friends.0.description" },
        { optionA: "refinements.Crying.heartwarming.friends.1.optionA", optionB: "refinements.Crying.heartwarming.friends.1.optionB", description: "refinements.Crying.heartwarming.friends.1.description" },
        { optionA: "refinements.Crying.heartwarming.friends.2.optionA", optionB: "refinements.Crying.heartwarming.friends.2.optionB", description: "refinements.Crying.heartwarming.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Crying.heartwarming.date.0.optionA", optionB: "refinements.Crying.heartwarming.date.0.optionB", description: "refinements.Crying.heartwarming.date.0.description" },
        { optionA: "refinements.Crying.heartwarming.date.1.optionA", optionB: "refinements.Crying.heartwarming.date.1.optionB", description: "refinements.Crying.heartwarming.date.1.description" },
        { optionA: "refinements.Crying.heartwarming.date.2.optionA", optionB: "refinements.Crying.heartwarming.date.2.optionB", description: "refinements.Crying.heartwarming.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Crying.heartwarming.family.0.optionA", optionB: "refinements.Crying.heartwarming.family.0.optionB", description: "refinements.Crying.heartwarming.family.0.description" },
        { optionA: "refinements.Crying.heartwarming.family.1.optionA", optionB: "refinements.Crying.heartwarming.family.1.optionB", description: "refinements.Crying.heartwarming.family.1.description" },
        { optionA: "refinements.Crying.heartwarming.family.2.optionA", optionB: "refinements.Crying.heartwarming.family.2.optionB", description: "refinements.Crying.heartwarming.family.2.description" },
      ]
    },
    "tragic": {
      "solo": [
        { optionA: "refinements.Crying.tragic.solo.0.optionA", optionB: "refinements.Crying.tragic.solo.0.optionB", description: "refinements.Crying.tragic.solo.0.description" },
        { optionA: "refinements.Crying.tragic.solo.1.optionA", optionB: "refinements.Crying.tragic.solo.1.optionB", description: "refinements.Crying.tragic.solo.1.description" },
        { optionA: "refinements.Crying.tragic.solo.2.optionA", optionB: "refinements.Crying.tragic.solo.2.optionB", description: "refinements.Crying.tragic.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Crying.tragic.friends.0.optionA", optionB: "refinements.Crying.tragic.friends.0.optionB", description: "refinements.Crying.tragic.friends.0.description" },
        { optionA: "refinements.Crying.tragic.friends.1.optionA", optionB: "refinements.Crying.tragic.friends.1.optionB", description: "refinements.Crying.tragic.friends.1.description" },
        { optionA: "refinements.Crying.tragic.friends.2.optionA", optionB: "refinements.Crying.tragic.friends.2.optionB", description: "refinements.Crying.tragic.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Crying.tragic.date.0.optionA", optionB: "refinements.Crying.tragic.date.0.optionB", description: "refinements.Crying.tragic.date.0.description" },
        { optionA: "refinements.Crying.tragic.date.1.optionA", optionB: "refinements.Crying.tragic.date.1.optionB", description: "refinements.Crying.tragic.date.1.description" },
        { optionA: "refinements.Crying.tragic.date.2.optionA", optionB: "refinements.Crying.tragic.date.2.optionB", description: "refinements.Crying.tragic.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Crying.tragic.family.0.optionA", optionB: "refinements.Crying.tragic.family.0.optionB", description: "refinements.Crying.tragic.family.0.description" },
        { optionA: "refinements.Crying.tragic.family.1.optionA", optionB: "refinements.Crying.tragic.family.1.optionB", description: "refinements.Crying.tragic.family.1.description" },
        { optionA: "refinements.Crying.tragic.family.2.optionA", optionB: "refinements.Crying.tragic.family.2.optionB", description: "refinements.Crying.tragic.family.2.description" },
      ]
    }
  },
  "Wondering": {
    "mindbending": {
      "solo": [
        { optionA: "refinements.Wondering.mindbending.solo.0.optionA", optionB: "refinements.Wondering.mindbending.solo.0.optionB", description: "refinements.Wondering.mindbending.solo.0.description" },
        { optionA: "refinements.Wondering.mindbending.solo.1.optionA", optionB: "refinements.Wondering.mindbending.solo.1.optionB", description: "refinements.Wondering.mindbending.solo.1.description" },
        { optionA: "refinements.Wondering.mindbending.solo.2.optionA", optionB: "refinements.Wondering.mindbending.solo.2.optionB", description: "refinements.Wondering.mindbending.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Wondering.mindbending.friends.0.optionA", optionB: "refinements.Wondering.mindbending.friends.0.optionB", description: "refinements.Wondering.mindbending.friends.0.description" },
        { optionA: "refinements.Wondering.mindbending.friends.1.optionA", optionB: "refinements.Wondering.mindbending.friends.1.optionB", description: "refinements.Wondering.mindbending.friends.1.description" },
        { optionA: "refinements.Wondering.mindbending.friends.2.optionA", optionB: "refinements.Wondering.mindbending.friends.2.optionB", description: "refinements.Wondering.mindbending.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Wondering.mindbending.date.0.optionA", optionB: "refinements.Wondering.mindbending.date.0.optionB", description: "refinements.Wondering.mindbending.date.0.description" },
        { optionA: "refinements.Wondering.mindbending.date.1.optionA", optionB: "refinements.Wondering.mindbending.date.1.optionB", description: "refinements.Wondering.mindbending.date.1.description" },
        { optionA: "refinements.Wondering.mindbending.date.2.optionA", optionB: "refinements.Wondering.mindbending.date.2.optionB", description: "refinements.Wondering.mindbending.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Wondering.mindbending.family.0.optionA", optionB: "refinements.Wondering.mindbending.family.0.optionB", description: "refinements.Wondering.mindbending.family.0.description" },
        { optionA: "refinements.Wondering.mindbending.family.1.optionA", optionB: "refinements.Wondering.mindbending.family.1.optionB", description: "refinements.Wondering.mindbending.family.1.description" },
        { optionA: "refinements.Wondering.mindbending.family.2.optionA", optionB: "refinements.Wondering.mindbending.family.2.optionB", description: "refinements.Wondering.mindbending.family.2.description" },
      ]
    },
    "epic": {
      "solo": [
        { optionA: "refinements.Wondering.epic.solo.0.optionA", optionB: "refinements.Wondering.epic.solo.0.optionB", description: "refinements.Wondering.epic.solo.0.description" },
        { optionA: "refinements.Wondering.epic.solo.1.optionA", optionB: "refinements.Wondering.epic.solo.1.optionB", description: "refinements.Wondering.epic.solo.1.description" },
        { optionA: "refinements.Wondering.epic.solo.2.optionA", optionB: "refinements.Wondering.epic.solo.2.optionB", description: "refinements.Wondering.epic.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Wondering.epic.friends.0.optionA", optionB: "refinements.Wondering.epic.friends.0.optionB", description: "refinements.Wondering.epic.friends.0.description" },
        { optionA: "refinements.Wondering.epic.friends.1.optionA", optionB: "refinements.Wondering.epic.friends.1.optionB", description: "refinements.Wondering.epic.friends.1.description" },
        { optionA: "refinements.Wondering.epic.friends.2.optionA", optionB: "refinements.Wondering.epic.friends.2.optionB", description: "refinements.Wondering.epic.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Wondering.epic.date.0.optionA", optionB: "refinements.Wondering.epic.date.0.optionB", description: "refinements.Wondering.epic.date.0.description" },
        { optionA: "refinements.Wondering.epic.date.1.optionA", optionB: "refinements.Wondering.epic.date.1.optionB", description: "refinements.Wondering.epic.date.1.description" },
        { optionA: "refinements.Wondering.epic.date.2.optionA", optionB: "refinements.Wondering.epic.date.2.optionB", description: "refinements.Wondering.epic.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Wondering.epic.family.0.optionA", optionB: "refinements.Wondering.epic.family.0.optionB", description: "refinements.Wondering.epic.family.0.description" },
        { optionA: "refinements.Wondering.epic.family.1.optionA", optionB: "refinements.Wondering.epic.family.1.optionB", description: "refinements.Wondering.epic.family.1.description" },
        { optionA: "refinements.Wondering.epic.family.2.optionA", optionB: "refinements.Wondering.epic.family.2.optionB", description: "refinements.Wondering.epic.family.2.description" },
      ]
    },
    "documentary": {
      "solo": [
        { optionA: "refinements.Wondering.documentary.solo.0.optionA", optionB: "refinements.Wondering.documentary.solo.0.optionB", description: "refinements.Wondering.documentary.solo.0.description" },
        { optionA: "refinements.Wondering.documentary.solo.1.optionA", optionB: "refinements.Wondering.documentary.solo.1.optionB", description: "refinements.Wondering.documentary.solo.1.description" },
        { optionA: "refinements.Wondering.documentary.solo.2.optionA", optionB: "refinements.Wondering.documentary.solo.2.optionB", description: "refinements.Wondering.documentary.solo.2.description" },
      ],
      "friends": [
        { optionA: "refinements.Wondering.documentary.friends.0.optionA", optionB: "refinements.Wondering.documentary.friends.0.optionB", description: "refinements.Wondering.documentary.friends.0.description" },
        { optionA: "refinements.Wondering.documentary.friends.1.optionA", optionB: "refinements.Wondering.documentary.friends.1.optionB", description: "refinements.Wondering.documentary.friends.1.description" },
        { optionA: "refinements.Wondering.documentary.friends.2.optionA", optionB: "refinements.Wondering.documentary.friends.2.optionB", description: "refinements.Wondering.documentary.friends.2.description" },
      ],
      "date": [
        { optionA: "refinements.Wondering.documentary.date.0.optionA", optionB: "refinements.Wondering.documentary.date.0.optionB", description: "refinements.Wondering.documentary.date.0.description" },
        { optionA: "refinements.Wondering.documentary.date.1.optionA", optionB: "refinements.Wondering.documentary.date.1.optionB", description: "refinements.Wondering.documentary.date.1.description" },
        { optionA: "refinements.Wondering.documentary.date.2.optionA", optionB: "refinements.Wondering.documentary.date.2.optionB", description: "refinements.Wondering.documentary.date.2.description" },
      ],
      "family": [
        { optionA: "refinements.Wondering.documentary.family.0.optionA", optionB: "refinements.Wondering.documentary.family.0.optionB", description: "refinements.Wondering.documentary.family.0.description" },
        { optionA: "refinements.Wondering.documentary.family.1.optionA", optionB: "refinements.Wondering.documentary.family.1.optionB", description: "refinements.Wondering.documentary.family.1.description" },
        { optionA: "refinements.Wondering.documentary.family.2.optionA", optionB: "refinements.Wondering.documentary.family.2.optionB", description: "refinements.Wondering.documentary.family.2.description" },
      ]
    }
  }
};

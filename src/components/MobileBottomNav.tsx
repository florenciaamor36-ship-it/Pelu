import React from 'react';
import {
  Calendar,
  Dog,
  Plus,
  Package,
  TrendingUp,
} from 'lucide-react';
import { TabType } from './Header';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewTurnoModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = () => {
  return null;
};




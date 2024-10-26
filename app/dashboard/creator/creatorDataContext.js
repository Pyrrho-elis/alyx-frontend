import { createContext, useContext } from 'react';


const CreatorDataContext = createContext(null);

export function useCreatorData() {
  const context = useContext(CreatorDataContext);
  if (!context) {
    throw new Error('useCreatorData must be used within a CreatorDataProvider');
  }
  return context;
}

export default CreatorDataContext;
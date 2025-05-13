import React, { createContext, useContext } from 'react';

type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

export const Tabs: React.FC<{
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}> = ({ children, value, onValueChange }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="flex space-x-1 rounded-xl bg-white border border-gray-100 p-1 shadow-sm overflow-x-auto">
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<{
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
}> = ({ children, value, disabled = false }) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs');
  }
  
  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isSelected
          ? 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white shadow-md'
          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{
  children: React.ReactNode;
  value: string;
}> = ({ children, value }) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs');
  }
  
  return context.value === value ? (
    <div className="animate-fade-in">{children}</div>
  ) : null;
};

export default Tabs;
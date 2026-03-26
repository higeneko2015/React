import React from 'react';
import { Tabs, TabList, Tab, TabPanel, type TabsProps, type TabProps, type TabPanelProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

// --- Styles ---

const tabListStyles = tv({
  base: 'flex items-end border-b border-gray-200 gap-1 px-2',
});

const tabStyles = tv({
  base: [
    'px-4 py-2.5 text-sm font-medium outline-none cursor-pointer',
    'border-b-2 -mb-px transition-colors duration-150 rounded-t-md',
    'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50',
  ].join(' '),
  variants: {
    isSelected: {
      true: 'text-blue-600 border-blue-600 bg-white hover:text-blue-700 hover:bg-white',
    },
    isFocusVisible: {
      true: 'ring-2 ring-blue-500 ring-offset-1',
    },
    isDisabled: {
      true: 'opacity-40 cursor-not-allowed hover:text-gray-500 hover:bg-transparent',
    },
  },
});

const tabPanelStyles = tv({
  base: 'outline-none animate-in fade-in duration-150',
});

// --- Types ---

export interface CompanyTabsProps extends TabsProps {
  className?: string;
}

export interface CompanyTabProps extends TabProps {
  children: React.ReactNode;
}

export interface CompanyTabPanelProps extends TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

// --- Sub-components ---

const CompanyTabList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <TabList className={tabListStyles({ class: className })}>
    {children}
  </TabList>
);

const CompanyTab: React.FC<CompanyTabProps> = ({ children, ...props }) => (
  <Tab
    {...props}
    className={({ isSelected, isFocusVisible, isDisabled }) =>
      tabStyles({ isSelected, isFocusVisible, isDisabled })
    }
  >
    {children}
  </Tab>
);

const CompanyTabPanel: React.FC<CompanyTabPanelProps> = ({ children, className, ...props }) => (
  <TabPanel
    {...props}
    className={tabPanelStyles({ class: className })}
  >
    {children}
  </TabPanel>
);

// --- Root component with sub-component pattern ---

const CompanyTabsRoot: React.FC<CompanyTabsProps> = ({ children, className, ...props }) => (
  <Tabs
    {...props}
    className={`flex flex-col w-full${className ? ` ${className}` : ''}`}
  >
    {children}
  </Tabs>
);

export const CompanyTabs = Object.assign(CompanyTabsRoot, {
  List: CompanyTabList,
  Tab: CompanyTab,
  Panel: CompanyTabPanel,
});

CompanyTabs.displayName = 'CompanyTabs';

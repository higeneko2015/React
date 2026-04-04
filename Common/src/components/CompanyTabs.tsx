import React from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';

// 型のインポートは一番下に！
import type { TabsProps, TabProps, TabPanelProps } from 'react-aria-components';

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

/**
 * 社内システム用共通タブコンポーネント（ルート）。
 * CompanyTabs.List, CompanyTabs.Tab, CompanyTabs.Panel と組み合わせて使用します。
 */
export interface CompanyTabsProps extends TabsProps {
  /** 追加のTailwindクラス名 */
  className?: string;
}

export interface CompanyTabProps extends TabProps {
  children: React.ReactNode;
  /** 追加のTailwindクラス名 */
  className?: string;
}

export interface CompanyTabPanelProps extends TabPanelProps {
  children: React.ReactNode;
  /** 追加のTailwindクラス名 */
  className?: string;
}

// --- Sub-components ---

const CompanyTabList = React.memo(({ children, className }: { children: React.ReactNode; className?: string }) => (
  <TabList className={twMerge(tabListStyles(), className)}>
    {children}
  </TabList>
));
CompanyTabList.displayName = 'CompanyTabList';

const CompanyTab = React.memo(({ children, className, ...props }: CompanyTabProps) => (
  <Tab
    {...props}
    className={({ isSelected, isFocusVisible, isDisabled }) =>
      twMerge(tabStyles({ isSelected, isFocusVisible, isDisabled }), className)
    }
  >
    {children}
  </Tab>
));
CompanyTab.displayName = 'CompanyTab';

const CompanyTabPanel = React.memo(({ children, className, ...props }: CompanyTabPanelProps) => (
  <TabPanel
    {...props}
    className={twMerge(tabPanelStyles(), className)}
  >
    {children}
  </TabPanel>
));
CompanyTabPanel.displayName = 'CompanyTabPanel';

// --- Root component with sub-component pattern ---

const CompanyTabsRoot = React.memo(({ children, className, ...props }: CompanyTabsProps) => (
  <Tabs
    {...props}
    className={twMerge('flex flex-col w-full', className)}
  >
    {children}
  </Tabs>
));
CompanyTabsRoot.displayName = 'CompanyTabsRoot';

const CompanyTabsComponent = CompanyTabsRoot as typeof CompanyTabsRoot & {
  List: typeof CompanyTabList;
  Tab: typeof CompanyTab;
  Panel: typeof CompanyTabPanel;
};
CompanyTabsComponent.List = CompanyTabList;
CompanyTabsComponent.Tab = CompanyTab;
CompanyTabsComponent.Panel = CompanyTabPanel;

export { CompanyTabsComponent as CompanyTabs };
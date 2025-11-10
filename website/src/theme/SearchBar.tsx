import React, {type ReactNode} from 'react';
import SearchBar from '@theme-original/SearchBar';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type SearchBarType from '@theme/SearchBar';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof SearchBarType>;

type CliqCustomFields = {
  readonly aiSearchEnabled?: boolean;
  readonly aiProvider?: string;
};

export default function SearchBarWrapper(props: Props): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const {aiSearchEnabled, aiProvider} =
    (siteConfig.customFields ?? {}) as CliqCustomFields;

  if (!aiSearchEnabled) {
    return <SearchBar {...props} />;
  }

  return (
    <div
      className="cliq-search"
      data-ai-search="enabled"
      data-ai-provider={aiProvider ?? 'none'}>
      <SearchBar {...props} />
    </div>
  );
}

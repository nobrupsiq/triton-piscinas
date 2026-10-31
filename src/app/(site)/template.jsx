import { ViewTransition } from 'react';

export default function Template({ children }) {
  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      <div className="page-enter">{children}</div>
    </ViewTransition>
  );
}

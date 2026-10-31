import { ViewTransition } from 'react';

// Same name on two pages: the image travels between them during navigation.
export default function SharedImage({ name, children }) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}

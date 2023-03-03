import React, { FC, useRef } from 'react';
import {
  useBooleanControl,
  useButtonControl,
  useNumberControl,
  useRadioControl,
  useStringControl,
} from 'storybox-react';
import { Window, WindowControl, WindowProps } from '../lib';
import { useAction } from '../lib/hooks/use-action';

export const Content = () => (
  <div style={{ padding: '10px' }}>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad, cupiditate deleniti exercitationem
    explicabo illo illum modi, nemo optio qui repellat sed similique vel voluptas. Impedit quae quis
    voluptatem. Accusantium beatae cum distinctio earum eveniet explicabo illum magnam maxime minus
    modi necessitatibus, non numquam quae quisquam saepe sed, suscipit unde! Accusantium aperiam
    asperiores aspernatur beatae commodi cum debitis delectus eius et eveniet fuga incidunt iure
    maiores, non nulla officia perferendis possimus quidem quo ratione rem saepe sapiente sint sit
    soluta tempora tenetur totam velit veniam veritatis? Dolor, earum, labore! Accusantium
    aspernatur autem debitis enim esse incidunt ipsa, laboriosam maiores modi natus non odit quae
    quam quis quisquam quod temporibus! Ab alias aliquam assumenda at corporis ex exercitationem
    explicabo impedit maiores odit, possimus quas voluptate voluptatibus. Beatae consectetur debitis
    distinctio dolorem fugit illo illum mollitia necessitatibus, nesciunt nisi odio porro qui
    recusandae reprehenderit, rerum saepe suscipit voluptas voluptates. Assumenda earum et quae
    sequi? Accusamus adipisci cum dolorem eos fugit, molestiae perferendis. Ex exercitationem
    laboriosam maxime nostrum numquam rerum voluptatibus. Ab aperiam asperiores assumenda autem
    cumque doloribus est exercitationem expedita fugit id illum ipsa iusto maiores minima nesciunt
    odit officia perspiciatis porro quidem quis quisquam repellendus reprehenderit repudiandae sunt,
    ullam ut velit. Voluptatibus!
  </div>
);

export const Header = () => <div style={{ padding: '20px' }}>header</div>;

export const Footer = () => <div style={{ padding: '20px' }}>footer</div>;

export const WindowStory: FC = () => {
  const controlRef = useRef<WindowControl | null>(null);

  const [active, setShown] = useBooleanControl({
    name: 'Active',
    defaultValue: false,
  });

  const [title] = useStringControl({
    defaultValue: 'Lorem window',
    name: 'Title',
    minLength: 0,
    maxLength: 1000,
  });

  useButtonControl({
    name: 'Minimize',
    onClick: () => controlRef.current?.minimize(),
  });

  useButtonControl({
    name: 'Maximize',
    onClick: () => controlRef.current?.maximize(),
  });

  useButtonControl({
    name: 'Normalize',
    onClick: () => controlRef.current?.normalize(),
  });

  const [canClose] = useBooleanControl({
    name: 'Can close',
    defaultValue: true,
  });

  const [canMinMax] = useBooleanControl({
    name: 'Can minmax',
    defaultValue: true,
  });

  const [canCollapse] = useBooleanControl({
    name: 'Can collapse',
    defaultValue: true,
  });

  const [steady] = useBooleanControl({
    name: 'Steady',
    defaultValue: false,
  });

  const [variant] = useRadioControl({
    name: 'Variant',
    options: ['liquid', 'solid'],
    defaultValue: 'liquid',
  });

  const [normalX] = useNumberControl({
    defaultValue: 600,
    name: 'Normal X',
    max: 1000,
    min: 600,
    appearance: 'range',
  });

  const [normalY] = useNumberControl({
    defaultValue: 400,
    name: 'Normal Y',
    max: 1000,
    min: 400,
    appearance: 'range',
  });

  const onClose = useAction(() => setShown(false));

  const parent = document.querySelector('.storybox-active-story');

  return parent ? (
    <Window
      active={active}
      onClose={onClose}
      header={<Header />}
      footer={<Footer />}
      canClose={canClose}
      canMinMax={canMinMax}
      canCollapse={canCollapse}
      steady={steady}
      variant={variant as WindowProps['variant']}
      controlRef={controlRef}
      parent={parent as HTMLElement}
      title={title}
      normalX={normalX}
      normalY={normalY}
    >
      <Content />
    </Window>
  ) : null;
};
